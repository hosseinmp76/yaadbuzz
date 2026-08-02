package com.yaadbuzz.support;

import static io.restassured.RestAssured.given;

import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import java.util.Map;

public final class ApiClient {

    private ApiClient() {
    }

    public static ValidatableResponse get(String token, String path) {
        return request(token).when().get(path).then();
    }

    public static ValidatableResponse post(String token, String path, Object body) {
        return request(token).body(body == null ? Map.of() : body).when().post(path).then();
    }

    public static ValidatableResponse patch(String token, String path, Object body) {
        return request(token).body(body == null ? Map.of() : body).when().patch(path).then();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> json(ValidatableResponse response, int status) {
        response.statusCode(status);
        return response.extract().as(Map.class);
    }

    private static io.restassured.specification.RequestSpecification request(String token) {
        var request = given().contentType(ContentType.JSON);
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return request;
    }
}
