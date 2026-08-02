package com.yaadbuzz.support;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

import com.yaadbuzz.domain.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.restassured.http.ContentType;
import java.util.Map;
import java.util.UUID;

public final class AuthSupport {

    private AuthSupport() {
    }

    /**
     * Completes email registration for tests: request setup email, then set password directly
     * so integration tests do not depend on parsing mock mail.
     */
    public static AuthSession register(String email, String password, String displayName) {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200);

        QuarkusTransaction.requiringNew().run(() -> {
            User user = User.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Registered user missing: " + email));
            user.passwordHash = BcryptUtil.bcryptHash(password);
            user.displayName = displayName;
            user.passwordResetTokenHash = null;
            user.passwordResetExpiresAt = null;
        });

        return login(email, password);
    }

    public static AuthSession login(String email, String password) {
        var response = given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email, "password", password))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .body("accessToken", notNullValue())
                .extract();

        return new AuthSession(
                response.path("accessToken"),
                response.path("refreshToken"),
                UUID.fromString(response.path("userId")),
                response.path("email"),
                response.path("displayName")
        );
    }

    public record AuthSession(
            String accessToken,
            String refreshToken,
            UUID userId,
            String email,
            String displayName
    ) {
    }
}
