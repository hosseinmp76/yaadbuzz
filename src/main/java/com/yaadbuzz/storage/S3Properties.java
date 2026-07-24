package com.yaadbuzz.storage;

import io.smallrye.config.ConfigMapping;

@ConfigMapping(prefix = "yaadbuzz.s3")
public interface S3Properties {
    String endpoint();
    String publicEndpoint();
    String accessKey();
    String secretKey();
    String bucket();
    String region();
}
