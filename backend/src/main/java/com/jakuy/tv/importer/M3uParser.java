package com.jakuy.tv.importer;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class M3uParser {

    private static final String EXTINF_PREFIX = "#EXTINF:";

    public List<M3uChannelItem> parse(String content) {
        List<M3uChannelItem> items = new ArrayList<>();
        if (content == null || content.isBlank()) {
            return items;
        }

        String[] lines = content.split("\\r?\\n");
        PendingEntry pending = null;

        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.isEmpty()) {
                continue;
            }

            if (line.startsWith(EXTINF_PREFIX)) {
                pending = safeParseExtInf(line);
            } else if (line.startsWith("#")) {
                // Skip other directives (e.g. #EXTVLCOPT, #EXTGRP) without losing the pending entry.
            } else if (pending != null) {
                M3uChannelItem item = buildItem(pending, line);
                if (item != null) {
                    items.add(item);
                }
                pending = null;
            }
        }

        return items;
    }

    private PendingEntry safeParseExtInf(String line) {
        try {
            String info = line.substring(EXTINF_PREFIX.length());
            int commaIndex = firstCommaOutsideQuotes(info);

            String attributes;
            String displayName;
            if (commaIndex >= 0) {
                attributes = info.substring(0, commaIndex);
                displayName = info.substring(commaIndex + 1).trim();
            } else {
                attributes = info;
                displayName = "";
            }

            return new PendingEntry(
                    attribute(attributes, "tvg-id"),
                    attribute(attributes, "tvg-name"),
                    attribute(attributes, "tvg-logo"),
                    attribute(attributes, "group-title"),
                    displayName
            );
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private M3uChannelItem buildItem(PendingEntry entry, String url) {
        String streamUrl = url.trim();
        if (streamUrl.isEmpty()) {
            return null;
        }
        boolean hasName = (entry.tvgName != null && !entry.tvgName.isBlank())
                || (entry.displayName != null && !entry.displayName.isBlank());
        if (!hasName) {
            return null;
        }
        return new M3uChannelItem(
                entry.tvgId,
                entry.tvgName,
                entry.displayName,
                entry.logoUrl,
                entry.groupTitle,
                streamUrl
        );
    }

    private int firstCommaOutsideQuotes(String text) {
        boolean inQuotes = false;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                return i;
            }
        }
        return -1;
    }

    private String attribute(String attributes, String name) {
        Pattern pattern = Pattern.compile(Pattern.quote(name) + "=\"([^\"]*)\"", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(attributes);
        if (matcher.find()) {
            String value = matcher.group(1).trim();
            return value.isEmpty() ? null : value;
        }
        return null;
    }

    private record PendingEntry(
            String tvgId,
            String tvgName,
            String logoUrl,
            String groupTitle,
            String displayName
    ) {
    }
}
