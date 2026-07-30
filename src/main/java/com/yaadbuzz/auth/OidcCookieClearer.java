package com.yaadbuzz.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.NewCookie;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Expire Quarkus OIDC session/state cookies left after social login.
 * Names cover default + google/github tenants (with/without token-split suffixes).
 */
@ApplicationScoped
public class OidcCookieClearer {

    private static final List<String> NAMES = List.of(
            "q_session",
            "q_session_google",
            "q_session_github",
            "q_session_at",
            "q_session_at_google",
            "q_session_at_github",
            "q_session_rt",
            "q_session_rt_google",
            "q_session_rt_github",
            "q_auth",
            "q_auth_google",
            "q_auth_github",
            "q_post_logout",
            "q_post_logout_google",
            "q_post_logout_github"
    );

    public NewCookie[] expiredCookies() {
        List<NewCookie> cookies = new ArrayList<>(NAMES.size() * 2);
        for (String name : NAMES) {
            cookies.add(expired(name, false));
            cookies.add(expired(name, true));
        }
        return cookies.toArray(NewCookie[]::new);
    }

    private static NewCookie expired(String name, boolean secure) {
        return new NewCookie.Builder(name)
                .value("")
                .path("/")
                .maxAge(0)
                .expiry(new Date(0))
                .httpOnly(true)
                .secure(secure)
                .sameSite(NewCookie.SameSite.LAX)
                .build();
    }
}
