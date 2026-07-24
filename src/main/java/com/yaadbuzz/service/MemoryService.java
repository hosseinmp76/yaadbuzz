package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.common.CursorPage;
import com.yaadbuzz.common.CursorUtil;
import com.yaadbuzz.domain.Comment;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class MemoryService {

    @Inject
    AccessService accessService;

    @Transactional
    public Memory create(UUID teamId, User user, String title, String bodyText, boolean privateMemory, List<UUID> taggedIds) {
        TeamMember writer = accessService.requireTeamMember(teamId, user);
        if (bodyText == null || bodyText.isBlank()) {
            throw ApiException.badRequest("Memory body is required");
        }
        Memory memory = new Memory();
        memory.team = writer.team;
        memory.writer = writer;
        memory.title = title;
        memory.bodyText = bodyText.trim();
        memory.privateMemory = privateMemory;
        memory.tagged = resolveTags(teamId, taggedIds);
        memory.persist();
        return memory;
    }

    public CursorPage<Memory> list(UUID teamId, User user, Integer first, String after) {
        TeamMember viewer = accessService.requireTeamMember(teamId, user);
        int limit = first == null || first < 1 || first > 50 ? 20 : first;
        CursorUtil.Cursor cursor = CursorUtil.decode(after);

        StringBuilder ql = new StringBuilder("team.id = ?1 and deletedAt is null");
        List<Object> params = new ArrayList<>();
        params.add(teamId);
        int idx = 2;
        if (cursor != null) {
            ql.append(" and (createdAt < ?").append(idx++)
                    .append(" or (createdAt = ?").append(idx++)
                    .append(" and id < ?").append(idx++).append("))");
            params.add(cursor.createdAt());
            params.add(cursor.createdAt());
            params.add(cursor.id());
        }
        ql.append(" order by createdAt desc, id desc");

        List<Memory> rows = Memory.find(ql.toString(), params.toArray()).page(0, limit + 5).list();
        List<Memory> visible = rows.stream()
                .filter(m -> !m.privateMemory || m.writer.id.equals(viewer.id) || m.tagged.stream().anyMatch(t -> t.id.equals(viewer.id)))
                .limit(limit + 1L)
                .toList();
        boolean hasNext = visible.size() > limit;
        List<Memory> page = hasNext ? visible.subList(0, limit) : visible;
        String next = null;
        if (hasNext && !page.isEmpty()) {
            Memory last = page.get(page.size() - 1);
            next = CursorUtil.encode(last.createdAt, last.id);
        }
        return new CursorPage<>(page, next, hasNext);
    }

    @Transactional
    public Comment addComment(UUID memoryId, User user, String text, UUID parentId, List<UUID> mediaIds) {
        Memory memory = Memory.findById(memoryId);
        if (memory == null || memory.isDeleted()) {
            throw ApiException.notFound("Memory not found");
        }
        TeamMember writer = accessService.requireTeamMember(memory.team.id, user);
        if (text == null || text.isBlank()) {
            throw ApiException.badRequest("Comment text is required");
        }
        Comment comment = new Comment();
        comment.memory = memory;
        comment.writer = writer;
        comment.text = text.trim();
        if (parentId != null) {
            Comment parent = Comment.findById(parentId);
            if (parent == null) {
                throw ApiException.notFound("Parent comment not found");
            }
            comment.parent = parent;
        }
        if (mediaIds != null) {
            for (UUID mediaId : mediaIds) {
                MediaAsset asset = MediaAsset.findById(mediaId);
                if (asset != null) {
                    comment.pictures.add(asset);
                }
            }
        }
        comment.persist();
        return comment;
    }

    public List<Comment> listComments(UUID memoryId, User user) {
        Memory memory = Memory.findById(memoryId);
        if (memory == null || memory.isDeleted()) {
            throw ApiException.notFound("Memory not found");
        }
        accessService.requireTeamMember(memory.team.id, user);
        return Comment.list("memory.id = ?1 and deletedAt is null order by createdAt asc", memoryId);
    }

    private Set<TeamMember> resolveTags(UUID teamId, List<UUID> taggedIds) {
        Set<TeamMember> tagged = new HashSet<>();
        if (taggedIds == null) {
            return tagged;
        }
        for (UUID id : taggedIds) {
            TeamMember member = TeamMember.findActiveById(id)
                    .orElseThrow(() -> ApiException.notFound("Tagged member not found: " + id));
            if (!member.team.id.equals(teamId)) {
                throw ApiException.badRequest("Tagged member must be in the same team");
            }
            tagged.add(member);
        }
        return tagged;
    }
}
