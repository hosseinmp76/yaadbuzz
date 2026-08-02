package com.yaadbuzz.auth;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.domain.User;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.MockMailbox;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class AuthResourceTest {

    private static final Pattern SETUP_TOKEN = Pattern.compile("/set-password\\?token=([a-f0-9]+)");

    @Inject
    MockMailbox mailbox;

    @BeforeEach
    void clearMailbox() {
        mailbox.clear();
    }

    @Test
    void registerLoginAndRefresh() {
        String email = "user-" + UUID.randomUUID() + "@example.com";

        AuthSupport.AuthSession registered = AuthSupport.register(email, "password123", "Tester");
        assertEquals(email, registered.email());

        AuthSupport.AuthSession loggedIn = AuthSupport.login(email, "password123");
        assertEquals(registered.userId(), loggedIn.userId());

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("refreshToken", loggedIn.refreshToken()))
                .when()
                .post("/api/auth/refresh")
                .then()
                .statusCode(200)
                .body("accessToken", notNullValue())
                .body("userId", equalTo(loggedIn.userId().toString()));
    }

    @Test
    void registerSendsSetPasswordEmailAndCompletesAccount() {
        String email = "setup-" + UUID.randomUUID() + "@example.com";

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200)
                .body("message", containsString("set your password"));

        QuarkusTransaction.requiringNew().run(() -> {
            User user = User.findByEmail(email).orElseThrow();
            assertFalse(user.hasPassword());
        });

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email, "password", "password123"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(401);

        List<Mail> mails = mailbox.getMailsSentTo(email);
        assertEquals(1, mails.size());
        String token = extractToken(mails.getFirst().getHtml());

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("token", token, "newPassword", "password123"))
                .when()
                .post("/api/auth/reset-password")
                .then()
                .statusCode(200);

        AuthSupport.AuthSession session = AuthSupport.login(email, "password123");
        assertEquals(email, session.email());

        QuarkusTransaction.requiringNew().run(() -> {
            User user = User.findByEmail(email).orElseThrow();
            assertTrue(user.hasPassword());
        });
    }

    @Test
    void registerDoesNotRevealExistingPasswordAccounts() {
        String email = "dup-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "First");
        mailbox.clear();

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200)
                .body("message", containsString("set your password"));

        assertTrue(mailbox.getMailsSentTo(email).isEmpty());
    }

    @Test
    void loginRejectsBadPassword() {
        String email = "badpw-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "Tester");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email, "password", "wrong-password"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    void changePasswordRequiresAuthAndCurrentPassword() {
        String email = "chg-" + UUID.randomUUID() + "@example.com";
        AuthSupport.AuthSession session = AuthSupport.register(email, "password123", "Changer");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "currentPassword", "password123",
                        "newPassword", "password456"
                ))
                .when()
                .post("/api/auth/change-password")
                .then()
                .statusCode(401);

        given()
                .auth().oauth2(session.accessToken())
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "currentPassword", "wrong-password",
                        "newPassword", "password456"
                ))
                .when()
                .post("/api/auth/change-password")
                .then()
                .statusCode(401);

        given()
                .auth().oauth2(session.accessToken())
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "currentPassword", "password123",
                        "newPassword", "password456"
                ))
                .when()
                .post("/api/auth/change-password")
                .then()
                .statusCode(200)
                .body("message", notNullValue());

        AuthSupport.login(email, "password456");
    }

    @Test
    void forgotPasswordAlwaysReturnsOk() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", "missing-" + UUID.randomUUID() + "@example.com"))
                .when()
                .post("/api/auth/forgot-password")
                .then()
                .statusCode(200);
    }

    @Test
    void sourceOfferIsPublic() {
        given()
                .when()
                .get("/api/source")
                .then()
                .statusCode(200)
                .body("license", equalTo("AGPL-3.0-only"))
                .body("sourceUrl", notNullValue());
    }

    private static String extractToken(String html) {
        Matcher matcher = SETUP_TOKEN.matcher(html);
        assertTrue(matcher.find(), "setup token missing from email html");
        return matcher.group(1);
    }
}
