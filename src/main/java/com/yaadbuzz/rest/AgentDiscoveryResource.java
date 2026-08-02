package com.yaadbuzz.rest;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Agent / AI discovery documents so crawlers don't get Quinoa SPA soft-404 HTML.
 */
@Path("/")
@Tag(name = "Agent discovery")
@PermitAll
public class AgentDiscoveryResource {

    @ConfigProperty(name = "yaadbuzz.public-url", defaultValue = "https://yaadbuzz.ir")
    String publicUrl;

    @ConfigProperty(name = "quarkus.application.version", defaultValue = "1.0.0-SNAPSHOT")
    String appVersion;

    private String base() {
        return publicUrl.replaceAll("/$", "");
    }

    @GET
    @Path(".well-known/api-catalog")
    @Produces({"application/linkset+json", MediaType.APPLICATION_JSON})
    @Operation(summary = "RFC 9727 API catalog")
    public Response apiCatalog() {
        String b = base();
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("anchor", b + "/");
        entry.put("service-desc", List.of(Map.of(
                "href", b + "/q/openapi",
                "type", "application/json"
        )));
        entry.put("service-doc", List.of(Map.of(
                "href", b + "/q/swagger-ui",
                "type", "text/html"
        )));
        entry.put("status", List.of(Map.of(
                "href", b + "/q/health",
                "type", "application/json"
        )));
        entry.put("describedby", List.of(Map.of(
                "href", b + "/auth.md",
                "type", "text/markdown"
        )));
        Map<String, Object> body = Map.of("linkset", List.of(entry));
        return Response.ok(body)
                .type("application/linkset+json")
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path(".well-known/agent-skills/index.json")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Agent Skills discovery index")
    public Response agentSkills() {
        String b = base();
        List<Map<String, Object>> skills = List.of(
                skill("yaadbuzz-overview", "skill", "What Yaadbuzz is and public URLs", b + "/about",
                        markdownAboutDigest()),
                skill("yaadbuzz-auth", "skill", "How agents authenticate (email/password JWT)", b + "/auth.md",
                        authMdDigest()),
                skill("yaadbuzz-openapi", "api", "REST OpenAPI for auth, media, and yearbook domain APIs", b + "/q/openapi",
                        "openapi"),
                skill("yaadbuzz-source", "skill", "AGPL corresponding source offer", b + "/source",
                        "source")
        );
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("$schema", "https://agentskills.io/schemas/discovery/v0.2.0.json");
        body.put("skills", skills);
        return Response.ok(body)
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path(".well-known/mcp/server-card.json")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "MCP server card (HTTP APIs; no dedicated MCP transport yet)")
    public Response mcpServerCard() {
        String b = base();
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("serverInfo", Map.of(
                "name", "yaadbuzz",
                "title", "Yaadbuzz",
                "version", appVersion
        ));
        card.put("description",
                "Yaadbuzz does not expose a Model Context Protocol transport yet. "
                        + "Agents should use REST under /api (auth, media, and yearbook domain). "
                        + "See OpenAPI and auth.md.");
        card.put("transport", Map.of(
                "type", "http",
                "url", b + "/q/openapi"
        ));
        card.put("capabilities", Map.of(
                "tools", false,
                "resources", false,
                "prompts", false
        ));
        card.put("related", Map.of(
                "apiCatalog", b + "/.well-known/api-catalog",
                "auth", b + "/auth.md",
                "openapi", b + "/q/openapi"
        ));
        return Response.ok(card)
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path(".well-known/oauth-protected-resource")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Protected resource metadata (JWT bearer; not a full OAuth AS)")
    public Response oauthProtectedResource() {
        String b = base();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("resource", b + "/");
        body.put("resource_name", "Yaadbuzz API");
        body.put("bearer_methods_supported", List.of("header"));
        body.put("scopes_supported", List.of("user"));
        body.put("authorization_servers", List.of());
        body.put("resource_documentation", b + "/auth.md");
        body.put("jwks_uri", b + "/.well-known/jwks.json");
        return Response.ok(body)
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path(".well-known/jwks.json")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Public JWKS placeholder note — JWT signed with app PEM keys")
    public Response jwks() {
        // SmallRye JWT uses PEM files, not a JWKS endpoint today.
        Map<String, Object> body = Map.of(
                "keys", List.of(),
                "note", "Yaadbuzz issues JWTs signed with server PEM keys. Obtain tokens via POST /api/auth/login. See /auth.md."
        );
        return Response.ok(body).header("Cache-Control", "public, max-age=3600").build();
    }

    @GET
    @Path(".well-known/http-message-signatures-directory")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "HTTP Message Signatures directory (Web Bot Auth)")
    public Response httpMessageSignaturesDirectory() {
        // Empty directory: we do not yet publish bot-auth keys.
        Map<String, Object> body = Map.of(
                "keys", List.of(),
                "purpose", "http-message-signatures",
                "note", "Yaadbuzz has not published Web Bot Auth signing keys yet."
        );
        return Response.ok(body)
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path("auth.md")
    @Produces("text/markdown; charset=UTF-8")
    @Operation(summary = "Agent authentication instructions")
    public Response authMd() {
        return Response.ok(authMarkdown())
                .type("text/markdown; charset=UTF-8")
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    private Map<String, Object> skill(String name, String type, String description, String url, String digestSeed) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("name", name);
        s.put("type", type);
        s.put("description", description);
        s.put("url", url);
        s.put("sha256", sha256Hex(digestSeed));
        return s;
    }

    private String authMarkdown() {
        String b = base();
        return """
                # Yaadbuzz agent authentication

                Yaadbuzz uses **local email/password JWT** (not a public OAuth/OIDC authorization server).

                ## Register

                ```http
                POST %s/api/auth/register
                Content-Type: application/json

                {"email":"you@example.com","password":"at-least-8-chars","displayName":"Your Name"}
                ```

                ## Login

                ```http
                POST %s/api/auth/login
                Content-Type: application/json

                {"email":"you@example.com","password":"at-least-8-chars"}
                ```

                Response includes `accessToken` and `refreshToken`.

                ## Call APIs

                ```http
                Authorization: Bearer <accessToken>
                ```

                - REST OpenAPI: %s/q/openapi
                - Domain API: `/api/organizations`, `/api/teams`, … (Bearer JWT)
                - Health: %s/q/health
                - API catalog: %s/.well-known/api-catalog

                ## Password reset

                `POST %s/api/auth/forgot-password` with `{ "email" }` then
                `POST %s/api/auth/reset-password` with `{ "token", "newPassword" }`.

                ## License

                AGPL-3.0 — corresponding source: %s/source
                """.formatted(b, b, b, b, b, b, b, b);
    }

    private String markdownAboutDigest() {
        return "yaadbuzz-about-v1";
    }

    private String authMdDigest() {
        return sha256Hex(authMarkdown());
    }

    private static String sha256Hex(String input) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "0".repeat(64);
        }
    }
}
