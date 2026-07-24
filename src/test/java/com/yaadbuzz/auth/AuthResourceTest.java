package com.yaadbuzz.auth;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

@QuarkusTest
class AuthResourceTest {

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
    void registerRejectsDuplicateEmail() {
        String email = "dup-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "First");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "email", email,
                        "password", "password123",
                        "displayName", "Second"
                ))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(409);
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
    void registerRequiresStrongEnoughPassword() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "email", "weak-" + UUID.randomUUID() + "@example.com",
                        "password", "short",
                        "displayName", "Weak"
                ))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(400);
    }
}
