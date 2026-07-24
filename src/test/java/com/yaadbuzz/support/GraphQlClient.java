package com.yaadbuzz.support;

import static io.restassured.RestAssured.given;

import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import java.util.Map;

public final class GraphQlClient {

    private GraphQlClient() {
    }

    public static ValidatableResponse query(String token, String query) {
        return query(token, query, Map.of());
    }

    public static ValidatableResponse query(String token, String query, Map<String, Object> variables) {
        var request = given().contentType(ContentType.JSON);
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return request
                .body(Map.of("query", query, "variables", variables))
                .when()
                .post("/graphql")
                .then();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> data(ValidatableResponse response) {
        response.statusCode(200);
        Map<String, Object> body = response.extract().as(Map.class);
        if (body.get("errors") != null) {
            throw new AssertionError("GraphQL errors: " + body.get("errors"));
        }
        return (Map<String, Object>) body.get("data");
    }
}
