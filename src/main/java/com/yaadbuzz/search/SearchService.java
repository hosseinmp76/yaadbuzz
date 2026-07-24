package com.yaadbuzz.search;

import com.yaadbuzz.common.CursorPage;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.service.AccessService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.search.mapper.orm.session.SearchSession;

@ApplicationScoped
public class SearchService {

    @Inject
    SearchSession searchSession;

    @Inject
    AccessService accessService;

    public CursorPage<SearchHit> search(UUID teamId, User user, String query, Integer first, String after) {
        accessService.requireTeamMember(teamId, user);
        int limit = first == null || first < 1 || first > 50 ? 20 : first;
        int offset = 0;
        if (after != null && !after.isBlank()) {
            try {
                offset = Integer.parseInt(after);
            } catch (NumberFormatException e) {
                offset = 0;
            }
        }
        if (query == null || query.isBlank()) {
            return new CursorPage<>(List.of(), null, false);
        }

        List<SearchHit> hits = new ArrayList<>();

        var members = searchSession.search(TeamMember.class)
                .where(f -> f.bool()
                        .must(f.match().field("team.id").matching(teamId))
                        .must(f.simpleQueryString().fields("nickname", "bio").matching(query)))
                .fetch(offset, limit + 1);
        members.hits().forEach(m -> hits.add(new SearchHit("TEAM_MEMBER", m.id, m.nickname, m.bio)));

        var tributes = searchSession.search(Tribute.class)
                .where(f -> f.bool()
                        .must(f.match().field("team.id").matching(teamId))
                        .must(f.simpleQueryString().fields("text").matching(query)))
                .fetch(0, limit);
        tributes.hits().stream()
                .filter(t -> !t.hidden && !t.isDeleted())
                .forEach(t -> hits.add(new SearchHit("TRIBUTE", t.id, null, t.text)));

        var memories = searchSession.search(Memory.class)
                .where(f -> f.bool()
                        .must(f.match().field("team.id").matching(teamId))
                        .must(f.simpleQueryString().fields("title", "bodyText").matching(query)))
                .fetch(0, limit);
        memories.hits().stream()
                .filter(m -> !m.isDeleted())
                .forEach(m -> hits.add(new SearchHit("MEMORY", m.id, m.title, m.bodyText)));

        var topics = searchSession.search(Topic.class)
                .where(f -> f.bool()
                        .must(f.match().field("team.id").matching(teamId))
                        .must(f.simpleQueryString().fields("title").matching(query)))
                .fetch(0, limit);
        topics.hits().stream()
                .filter(t -> !t.isDeleted())
                .forEach(t -> hits.add(new SearchHit("TOPIC", t.id, t.title, null)));

        boolean hasNext = hits.size() > limit;
        List<SearchHit> page = hasNext ? hits.subList(0, limit) : hits;
        String next = hasNext ? String.valueOf(offset + limit) : null;
        return new CursorPage<>(page, next, hasNext);
    }

    public record SearchHit(String type, UUID id, String title, String snippet) {
    }
}
