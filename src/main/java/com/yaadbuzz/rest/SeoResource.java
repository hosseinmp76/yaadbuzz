package com.yaadbuzz.rest;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Serves SEO files with correct Content-Type. Quinoa static assets for
 * {@code sitemap.xml} were reachable but often without {@code application/xml},
 * which breaks crawlers and Search Console.
 */
@Path("/")
@Tag(name = "SEO")
@PermitAll
public class SeoResource {

    @ConfigProperty(name = "yaadbuzz.public-url", defaultValue = "https://yaadbuzz.ir")
    String publicUrl;

    @GET
    @Path("sitemap.xml")
    @Produces("application/xml; charset=UTF-8")
    @Operation(summary = "Public sitemap")
    public Response sitemap() {
        String base = publicUrl.replaceAll("/$", "");
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                  <url>
                    <loc>%s/</loc>
                    <changefreq>weekly</changefreq>
                    <priority>1.0</priority>
                  </url>
                  <url>
                    <loc>%s/about</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.8</priority>
                  </url>
                  <url>
                    <loc>%s/source</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                  </url>
                  <url>
                    <loc>%s/register</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.8</priority>
                  </url>
                  <url>
                    <loc>%s/login</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.5</priority>
                  </url>
                </urlset>
                """.formatted(base, base, base, base, base);
        return Response.ok(xml)
                .type("application/xml; charset=UTF-8")
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }

    @GET
    @Path("robots.txt")
    @Produces("text/plain; charset=UTF-8")
    @Operation(summary = "Robots exclusion file")
    public Response robots() {
        String base = publicUrl.replaceAll("/$", "");
        String body = """
                User-agent: *
                Allow: /
                Allow: /about
                Allow: /source
                Allow: /login
                Allow: /register
                Allow: /LICENSE.txt

                Disallow: /app
                Disallow: /preferences
                Disallow: /orgs/
                Disallow: /teams/
                Disallow: /members/
                Disallow: /join
                Disallow: /y/
                Disallow: /api/
                Disallow: /q/

                Sitemap: %s/sitemap.xml
                """.formatted(base);
        return Response.ok(body)
                .type("text/plain; charset=UTF-8")
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }
}
