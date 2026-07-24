package com.yaadbuzz.pdf;

import java.util.List;
import java.util.UUID;

/** Assembled yearbook view model shared by PDF export and online preview. */
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
    ) {}

    public record Memory(String title, String body, String writer) {}

    public record Standing(String nickname, int score) {}

    public record Topic(String title, List<Standing> standings) {}
}
