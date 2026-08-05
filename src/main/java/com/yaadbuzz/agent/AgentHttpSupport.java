package com.yaadbuzz.agent;

import io.vertx.ext.web.Router;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import java.util.Locale;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Adds agent-discovery Link headers on HTML responses and serves Markdown when
 * clients send {@code Accept: text/markdown} for public marketing pages.
 */
@ApplicationScoped
public class AgentHttpSupport {

    @ConfigProperty(name = "yaadbuzz.public-url", defaultValue = "https://yaadbuzz.ir")
    String publicUrl;

    void register(@Observes Router router) {
        String base = publicUrl.replaceAll("/$", "");

        router.route().order(-2000).handler(rc -> {
            rc.addHeadersEndHandler(v -> {
                String ct = rc.response().headers().get("Content-Type");
                if (ct != null && ct.toLowerCase(Locale.ROOT).contains("text/html")) {
                    var h = rc.response().headers();
                    h.add("Link", "</.well-known/api-catalog>; rel=\"api-catalog\"");
                    h.add("Link", "</.well-known/agent-skills/index.json>; rel=\"https://agentskills.io/rel/index\"");
                    h.add("Link", "</auth.md>; rel=\"describedby\"; type=\"text/markdown\"");
                    h.add("Link", "</q/openapi>; rel=\"service-desc\"; type=\"application/json\"");
                    h.add("Link", "</q/swagger-ui>; rel=\"service-doc\"");
                    h.add("Link", "</q/health>; rel=\"status\"");
                    h.add("Link", "<" + base + "/source>; rel=\"license\"");
                    if (!h.contains("Vary")) {
                        h.add("Vary", "Accept");
                    } else if (!h.getAll("Vary").stream().anyMatch(s -> s.toLowerCase(Locale.ROOT).contains("accept"))) {
                        h.add("Vary", "Accept");
                    }
                }
            });
            rc.next();
        });

        registerMarkdown(router, "/", markdownHome(base));
        registerMarkdown(router, "/about", markdownAbout(base));
        registerMarkdown(router, "/source", markdownSource(base));
        registerMarkdown(router, "/login", markdownLogin(base));
        registerMarkdown(router, "/register", markdownRegister(base));
    }

    private void registerMarkdown(Router router, String path, String body) {
        router.get(path).order(-1000).handler(rc -> {
            if (!prefersMarkdown(rc.request().getHeader("Accept"))) {
                rc.next();
                return;
            }
            rc.response()
                    .putHeader("Content-Type", "text/markdown; charset=UTF-8")
                    .putHeader("Vary", "Accept")
                    .putHeader("Cache-Control", "public, max-age=300")
                    .end(body);
        });
    }

    static boolean prefersMarkdown(String accept) {
        if (accept == null || accept.isBlank()) {
            return false;
        }
        String lower = accept.toLowerCase(Locale.ROOT);
        int md = indexOfMedia(lower, "text/markdown");
        if (md < 0) {
            return false;
        }
        int html = indexOfMedia(lower, "text/html");
        if (html < 0) {
            return true;
        }
        return md <= html;
    }

    private static int indexOfMedia(String acceptLower, String type) {
        int idx = acceptLower.indexOf(type);
        if (idx < 0) {
            return -1;
        }
        // Prefer earlier listing; treat q=0 as absent
        int qIdx = acceptLower.indexOf("q=", idx);
        int comma = acceptLower.indexOf(',', idx);
        if (qIdx > idx && (comma < 0 || qIdx < comma)) {
            try {
                String qPart = acceptLower.substring(qIdx + 2).split("[,;]")[0].trim();
                if (Double.parseDouble(qPart) <= 0) {
                    return -1;
                }
            } catch (NumberFormatException ignored) {
                // keep
            }
        }
        return idx;
    }

    private static String markdownHome(String base) {
        return """
                # Yaadbuzz

                Online yearbooks for teams — tributes, memories, awards, and printable PDFs.

                - Website: %s/
                - About: %s/about
                - Source (AGPL): %s/source
                - Register: %s/register
                - Log in: %s/login
                - API catalog: %s/.well-known/api-catalog
                - OpenAPI: %s/q/openapi
                - Auth for agents: %s/auth.md

                Yaadbuzz is free and open source under the GNU Affero GPL v3.
                """.formatted(base, base, base, base, base, base, base, base);
    }

    private static String markdownAbout(String base) {
        return """
                # About Yaadbuzz

                Yaadbuzz is an online yearbook born from a college wish to keep shared memories together.

                Teams collect tributes, memories (with photos), awards/votes, then view and print a yearbook.

                - Home: %s/
                - License / source: %s/source
                """.formatted(base, base);
    }

    private static String markdownSource(String base) {
        return """
                # Corresponding source

                Yaadbuzz is licensed under AGPL-3.0. Corresponding source for this deployment:

                - %s/source
                - %s/api/source
                - License text: %s/LICENSE.txt
                """.formatted(base, base, base);
    }

    private static String markdownLogin(String base) {
        return """
                # Log in to Yaadbuzz

                Human UI: %s/login

                Agents should authenticate via REST (see %s/auth.md):

                `POST %s/api/auth/login` with JSON `{ "email", "password" }` → JWT access token.
                """.formatted(base, base, base);
    }

    private static String markdownRegister(String base) {
        return """
                # Create a Yaadbuzz account

                Human UI: %s/register

                Agents: `POST %s/api/auth/register` with JSON `{ "email" }` (set-password link emailed),
                then `POST %s/api/auth/reset-password` with `{ "token", "newPassword" }`.
                Details: %s/auth.md
                """.formatted(base, base, base, base);
    }
}
