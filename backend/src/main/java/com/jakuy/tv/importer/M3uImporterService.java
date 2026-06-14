package com.jakuy.tv.importer;

import com.jakuy.tv.channel.Channel;
import com.jakuy.tv.channel.ChannelRepository;
import com.jakuy.tv.common.Countries;
import com.jakuy.tv.exception.ImportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class M3uImporterService {

    private static final Logger log = LoggerFactory.getLogger(M3uImporterService.class);
    private static final Pattern UZBEK_TVG_ID = Pattern.compile("\\.uz(@|$)", Pattern.CASE_INSENSITIVE);

    private final ChannelRepository repository;
    private final M3uParser parser;
    private final String uzbekUrl;
    private final String fallbackUrl;
    private final HttpClient httpClient;

    public M3uImporterService(
            ChannelRepository repository,
            M3uParser parser,
            @Value("${jakuy.import.uzbek-url}") String uzbekUrl,
            @Value("${jakuy.import.fallback-url}") String fallbackUrl) {
        this.repository = repository;
        this.parser = parser;
        this.uzbekUrl = uzbekUrl;
        this.fallbackUrl = fallbackUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Transactional
    public ImportResultDto importUzbekChannels() {
        String source = uzbekUrl;
        boolean fromUzPlaylist = true;

        String content = tryDownload(uzbekUrl);
        List<M3uChannelItem> items = content == null ? List.of() : parser.parse(content);

        if (items.isEmpty()) {
            log.warn("Uzbek playlist unavailable or empty, falling back to global index");
            content = tryDownload(fallbackUrl);
            if (content == null) {
                throw new ImportException("Unable to download Uzbek playlist or fallback playlist");
            }
            items = parser.parse(content);
            source = fallbackUrl;
            fromUzPlaylist = false;
        }

        return persist(items, fromUzPlaylist, source);
    }

    private ImportResultDto persist(List<M3uChannelItem> items, boolean fromUzPlaylist, String source) {
        int imported = 0;
        int updated = 0;
        int skipped = 0;
        Set<String> seenKeys = new HashSet<>();

        for (M3uChannelItem item : items) {
            if (!isUzbek(item, fromUzPlaylist)) {
                skipped++;
                continue;
            }

            String dedupeKey = dedupeKey(item);
            if (!seenKeys.add(dedupeKey)) {
                skipped++;
                continue;
            }

            Optional<Channel> existing = findExisting(item);
            if (existing.isPresent()) {
                applyItem(existing.get(), item);
                updated++;
            } else {
                repository.save(applyItem(new Channel(), item));
                imported++;
            }
        }

        log.info("Uzbek import complete: imported={}, updated={}, skipped={}, totalParsed={}, source={}",
                imported, updated, skipped, items.size(), source);
        return new ImportResultDto(imported, updated, skipped, items.size(), source);
    }

    private Optional<Channel> findExisting(M3uChannelItem item) {
        if (item.tvgId() != null && !item.tvgId().isBlank()) {
            Optional<Channel> byTvgId = repository.findByTvgIdIgnoreCase(item.tvgId());
            if (byTvgId.isPresent()) {
                return byTvgId;
            }
        }
        return repository.findByStreamUrl(item.streamUrl());
    }

    private Channel applyItem(Channel channel, M3uChannelItem item) {
        channel.setTvgId(item.tvgId());
        channel.setName(item.resolvedName());
        channel.setLogoUrl(item.logoUrl());
        channel.setCategory(normalizeCategory(item.groupTitle()));
        channel.setStreamUrl(item.streamUrl());
        channel.setCountry(Countries.UZBEKISTAN);
        channel.setCountryCode(Countries.UZ_CODE);
        if (channel.getLanguage() == null) {
            channel.setLanguage(Countries.UZBEK_LANGUAGE);
        }
        return channel;
    }

    private String normalizeCategory(String groupTitle) {
        if (groupTitle == null || groupTitle.isBlank() || "Undefined".equalsIgnoreCase(groupTitle.trim())) {
            return "General";
        }
        return groupTitle.trim();
    }

    private boolean isUzbek(M3uChannelItem item, boolean fromUzPlaylist) {
        if (fromUzPlaylist) {
            return true;
        }
        return item.tvgId() != null && UZBEK_TVG_ID.matcher(item.tvgId()).find();
    }

    private String dedupeKey(M3uChannelItem item) {
        if (item.tvgId() != null && !item.tvgId().isBlank()) {
            return "tvg:" + item.tvgId().toLowerCase();
        }
        return "url:" + item.streamUrl();
    }

    private String tryDownload(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(30))
                    .header("User-Agent", "JakuyTV/0.1 (+https://github.com/jakuy-tv)")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
            log.warn("Download of {} returned status {}", url, response.statusCode());
            return null;
        } catch (IOException ex) {
            log.warn("Download of {} failed: {}", url, ex.getMessage());
            return null;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ImportException("Import interrupted while downloading " + url);
        }
    }
}
