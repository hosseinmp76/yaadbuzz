package com.yaadbuzz.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Singleton row (id = 1) for deployment-wide settings. */
@Entity
@Table(name = "app_config")
public class AppConfig extends PanacheEntityBase {

    public static final short SINGLETON_ID = 1;

    @Id
    public short id = SINGLETON_ID;

    @Column(name = "team_encryption_enabled", nullable = false)
    public boolean teamEncryptionEnabled = false;

    public static AppConfig require() {
        AppConfig config = findById(SINGLETON_ID);
        if (config == null) {
            throw new IllegalStateException("app_config row is missing");
        }
        return config;
    }
}
