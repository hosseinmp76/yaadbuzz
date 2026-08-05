package com.yaadbuzz.service;

import com.yaadbuzz.domain.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AppConfigService {

    @Transactional
    public AppConfig get() {
        return AppConfig.require();
    }

    @Transactional
    public boolean isTeamEncryptionOffered() {
        return AppConfig.require().teamEncryptionEnabled;
    }

    @Transactional
    public void setTeamEncryptionOffered(boolean enabled) {
        AppConfig config = AppConfig.require();
        config.teamEncryptionEnabled = enabled;
    }
}
