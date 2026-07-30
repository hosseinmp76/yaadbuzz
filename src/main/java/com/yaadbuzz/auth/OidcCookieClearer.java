package com.yaadbuzz.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.NewCookie;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Expire Quarkus OIDC session/state cookies left after social login.
 * Clears cookies present on the request plus common tenant session names.
 */
@ApplicationScoped
public class OidcCookieClearer {

    private static final List<String> ALWAYS = List.of(
            "q_session",
            "q_session_google",
            "q_session_github",
            "q_session_telegram",
            "q_auth",
            "q_auth_google",
            "q_auth_github",
            "q_auth_telegram"
    );

    public NewCookie[] expiredCookies() {
        return expiredCookies(null);
    }

    public NewCookie[] expiredCookies(HttpHeaders headers) {
        Set<String> names = new LinkedHashSet<>(ALWAYS);
        if (headers != null) {
            Map<String, Cookie> cookies = headers.getCookies();
            if (cookies != null) {
                for (String name : cookies.keySet()) {
                    if (isOidcCookie(name)) {
                        names.add(name);
                    }
                }
            }
        }
        List<NewCookie> out = new ArrayList<>(names.size());
        for (String name : names) {
            out.add(expired(name));
        }
        return out.toArray(NewCookie[]::new);
    }

    static boolean isOidcCookie(String name) {
        return name != null && (name.startsWith("q_session")
                || name.startsWith("q_auth")
                || name.startsWith("q_post_logout"));
    }

    private static NewCookie expired(String name) {
        return new NewCookie.Builder(name)
                .value("")
                .path("/")
                .maxAge(0)
                .expiry(new Date(0))
                .httpOnly(true)
                .secure(true)
                .sameSite(NewCookie.SameSite.LAX)
                .build();
    }
}
