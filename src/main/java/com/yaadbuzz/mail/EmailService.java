package com.yaadbuzz.mail;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.qute.Location;
import io.quarkus.qute.Template;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);

    @Inject
    Mailer mailer;

    @Inject
    @Location("mail/password-reset")
    Template passwordResetTemplate;

    @ConfigProperty(name = "yaadbuzz.public-url", defaultValue = "http://localhost:8080")
    String publicUrl;

    @ConfigProperty(name = "yaadbuzz.mail.from", defaultValue = "Yaadbuzz <noreply@yaadbuzz.ir>")
    String from;

    @ConfigProperty(name = "quarkus.mailer.mock", defaultValue = "true")
    boolean mock;

    public void sendPasswordReset(String toEmail, String displayName, String rawToken) {
        String resetUrl = publicUrl.replaceAll("/$", "") + "/reset-password?token=" + rawToken;
        String html = passwordResetTemplate
                .data("displayName", displayName)
                .data("resetUrl", resetUrl)
                .data("publicUrl", publicUrl)
                .render();
        Mail mail = Mail.withHtml(toEmail, "Reset your Yaadbuzz password", html).setFrom(from);
        try {
            mailer.send(mail);
            if (mock) {
                LOG.infof("Mock mail password-reset to %s link=%s", toEmail, resetUrl);
            }
        } catch (RuntimeException e) {
            LOG.errorf(e, "Failed to send password reset email to %s", toEmail);
            throw e;
        }
    }
}
