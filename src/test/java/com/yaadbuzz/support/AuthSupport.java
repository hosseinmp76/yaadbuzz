package com.yaadbuzz.support;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.http.ContentType;
import java.util.Map;
import java.util.UUID;

public final class AuthSupport {

    private AuthSupport() {
    }

    public static AuthSession register(String email, String password, String displayName) {
        var response = given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "email", email,
                        "password", password,
                        "displayName", displayName
                ))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200)
                .body("accessToken", notNullValue())
                .body("refreshToken", notNullValue())
                .extract();

        return new AuthSession(
                response.path("accessToken"),
                response.path("refreshToken"),
                UUID.fromString(response.path("userId")),
                response.path("email"),
                response.path("displayName")
        );
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
