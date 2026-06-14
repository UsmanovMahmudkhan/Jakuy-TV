package com.jakuy.tv.importer;

public record M3uChannelItem(
        String tvgId,
        String tvgName,
        String displayName,
        String logoUrl,
        String groupTitle,
        String streamUrl
) {

    public String resolvedName() {
        if (tvgName != null && !tvgName.isBlank()) {
            return tvgName.trim();
        }
        return displayName == null ? "" : displayName.trim();
    }
}
