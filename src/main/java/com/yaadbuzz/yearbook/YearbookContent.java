package com.yaadbuzz.yearbook;

import java.util.List;
import java.util.UUID;

/** Assembled yearbook view model for online viewing and print. */
public record YearbookContent(
        UUID teamId,
        String orgName,
        String teamName,
        String title,
        String subtitle,
        String dedication,
        String theme,
        String brandColor,
        String logoUrl,
        String coverMediaUrl,
        boolean showMembers,
        boolean showTributes,
        boolean showCharacteristics,
        boolean showMemories,
        boolean showAwards,
        List<Member> members,
        List<Memory> memories,
        List<Topic> topics
) {
    public record Characteristic(String title, int count) {}

    public record Tribute(String text, String writer) {}

    public record Member(
            String nickname,
            String bio,
            String avatarUrl,
            List<Characteristic> characteristics,
            List<Tribute> tributes
    ) {
        public String initial() {
            if (nickname == null || nickname.isBlank()) {
                return "?";
            }
            return nickname.trim().substring(0, 1).toUpperCase();
        }
    }

    public record Comment(String text, String writer, List<String> imageUrls) {}

    public record Memory(
            String title,
            String body,
            String writer,
            List<String> imageUrls,
            List<Comment> comments
    ) {}

    public record Standing(String nickname, int score) {}

    public record Topic(String title, List<Standing> standings) {}
}
