package com.yaadbuzz.auth;

import com.yaadbuzz.domain.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class TokenService {

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "3600")
    long accessTtlSeconds;

    @ConfigProperty(name = "yaadbuzz.jwt.refresh-ttl", defaultValue = "P7D")
    Duration refreshTtl;

    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        return Jwt.issuer(issuer)
                .upn(user.email)
                .subject(user.id.toString())
                .groups(Set.of("user"))
                .claim("displayName", user.displayName)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(accessTtlSeconds))
                .sign();
    }

    public String issueRefreshToken(User user) {
        Instant now = Instant.now();
        return Jwt.issuer(issuer)
                .upn(user.email)
                .subject(user.id.toString())
                .groups(Set.of("refresh"))
                .claim("type", "refresh")
                .issuedAt(now)
                .expiresAt(now.plus(refreshTtl))
                .sign();
    }
}
