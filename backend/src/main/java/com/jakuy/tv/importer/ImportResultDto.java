package com.jakuy.tv.importer;

public record ImportResultDto(
        int imported,
        int updated,
        int skipped,
        int totalParsed,
        String source
) {
}
