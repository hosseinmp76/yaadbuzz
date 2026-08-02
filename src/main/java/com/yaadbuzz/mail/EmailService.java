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

    @Inject
    @Location("mail/account-setup")
    Template accountSetupTemplate;

    @Inject
    @Location("mail/team-invite")
    Template teamInviteTemplate;

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
        send(toEmail, "Reset your Yaadbuzz password", html, "password-reset", resetUrl);
    }

    public void sendAccountSetup(String toEmail, String displayName, String rawToken) {
        String setupUrl = publicUrl.replaceAll("/$", "") + "/set-password?token=" + rawToken;
        String html = accountSetupTemplate
                .data("displayName", displayName)
                .data("setupUrl", setupUrl)
                .data("publicUrl", publicUrl)
                .render();
        send(toEmail, "Set your Yaadbuzz password", html, "account-setup", setupUrl);
    }

    public void sendTeamInvite(
            String toEmail,
            String inviterName,
            String teamName,
            String orgName,
            String inviteCode
    ) {
        String joinUrl = publicUrl.replaceAll("/$", "") + "/join?code=" + inviteCode;
        String html = teamInviteTemplate
                .data("inviterName", inviterName)
                .data("teamName", teamName)
                .data("orgName", orgName)
                .data("inviteCode", inviteCode)
                .data("joinUrl", joinUrl)
                .data("publicUrl", publicUrl)
                .render();
        send(toEmail, "You're invited to " + teamName + " on Yaadbuzz", html, "team-invite", joinUrl);
    }

    private void send(String toEmail, String subject, String html, String kind, String linkForLog) {
        Mail mail = Mail.withHtml(toEmail, subject, html).setFrom(from);
        try {
            mailer.send(mail);
            if (mock) {
                LOG.infof("Mock mail %s to %s link=%s", kind, toEmail, linkForLog);
            }
        } catch (RuntimeException e) {
            LOG.errorf(e, "Failed to send %s email to %s", kind, toEmail);
            throw e;
        }
    }
}
