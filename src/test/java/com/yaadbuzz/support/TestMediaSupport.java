package com.yaadbuzz.support;

import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.User;
import io.quarkus.narayana.jta.QuarkusTransaction;
import java.util.UUID;

/** Creates MediaAsset rows without MinIO so REST mapping can exercise lazy avatar fields. */
public final class TestMediaSupport {

    private TestMediaSupport() {
    }

    public static UUID createPngAsset(UUID uploadedByUserId, String urlSeed) {
        return QuarkusTransaction.requiringNew().call(() -> {
            User uploader = User.findById(uploadedByUserId);
            if (uploader == null) {
                throw new IllegalStateException("User not found: " + uploadedByUserId);
            }
            MediaAsset asset = new MediaAsset();
            asset.storageKey = "test/" + urlSeed + "-" + UUID.randomUUID();
            asset.url = "http://example.test/media/" + urlSeed + ".png";
            asset.mimeType = "image/png";
            asset.sizeBytes = 128;
            asset.uploadedBy = uploader;
            asset.persist();
            return asset.id;
        });
    }
}
