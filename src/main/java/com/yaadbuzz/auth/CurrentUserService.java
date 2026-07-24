package com.yaadbuzz.auth;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.User;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.util.UUID;
import org.eclipse.microprofile.jwt.JsonWebToken;

@RequestScoped
public class CurrentUserService {

    @Inject
    SecurityIdentity identity;

    public User requireUser() {
        if (identity == null || identity.isAnonymous()) {
            throw ApiException.unauthorized("Authentication required");
        }
        String subject;
        if (identity.getPrincipal() instanceof JsonWebToken jwt) {
            subject = jwt.getSubject();
        } else {
            subject = identity.getPrincipal().getName();
        }
        try {
            UUID userId = UUID.fromString(subject);
            return User.findActiveById(userId)
                    .orElseThrow(() -> ApiException.unauthorized("User not found"));
        } catch (IllegalArgumentException e) {
            throw ApiException.unauthorized("Invalid authentication token");
        }
    }
}
