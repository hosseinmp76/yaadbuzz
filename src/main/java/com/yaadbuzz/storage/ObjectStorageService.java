package com.yaadbuzz.storage;

import com.yaadbuzz.common.ApiException;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.net.URI;
import java.util.UUID;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@ApplicationScoped
public class ObjectStorageService {

    @Inject
    S3Properties props;

    private volatile S3Client client;

    private S3Client client() {
        S3Client local = client;
        if (local == null) {
            synchronized (this) {
                local = client;
                if (local == null) {
                    local = S3Client.builder()
                            .endpointOverride(URI.create(props.endpoint()))
                            .region(Region.of(props.region()))
                            .credentialsProvider(StaticCredentialsProvider.create(
                                    AwsBasicCredentials.create(props.accessKey(), props.secretKey())))
                            .httpClientBuilder(UrlConnectionHttpClient.builder())
                            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                            .build();
                    client = local;
                    ensureBucket(local);
                }
            }
        }
        return local;
    }

    @PreDestroy
    void shutdown() {
        if (client != null) {
            client.close();
        }
    }

    private void ensureBucket(S3Client s3) {
        try {
            s3.headBucket(HeadBucketRequest.builder().bucket(props.bucket()).build());
        } catch (NoSuchBucketException e) {
            s3.createBucket(CreateBucketRequest.builder().bucket(props.bucket()).build());
        } catch (Exception ignored) {
            // MinIO may not be up yet; upload will fail clearly later
        }
    }

    public StoredObject upload(byte[] bytes, String mimeType, String folder) {
        String key = folder + "/" + UUID.randomUUID();
        try {
            client().putObject(
                    PutObjectRequest.builder()
                            .bucket(props.bucket())
                            .key(key)
                            .contentType(mimeType)
                            .build(),
                    RequestBody.fromBytes(bytes)
            );
            String url = props.publicEndpoint().replaceAll("/$", "") + "/" + props.bucket() + "/" + key;
            return new StoredObject(key, url);
        } catch (Exception e) {
            throw ApiException.badRequest("Failed to upload file: " + e.getMessage());
        }
    }

    public byte[] download(String storageKey) {
        try {
            return client().getObjectAsBytes(GetObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(storageKey)
                    .build()).asByteArray();
        } catch (Exception e) {
            throw ApiException.notFound("File not found");
        }
    }

    public record StoredObject(String storageKey, String url) {
    }
}
