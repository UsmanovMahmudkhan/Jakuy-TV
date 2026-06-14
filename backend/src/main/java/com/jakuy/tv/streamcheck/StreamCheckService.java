package com.jakuy.tv.streamcheck;

import com.jakuy.tv.channel.Channel;
import com.jakuy.tv.channel.ChannelRepository;
import com.jakuy.tv.common.Countries;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class StreamCheckService {

    private static final Logger log = LoggerFactory.getLogger(StreamCheckService.class);

    private final ChannelRepository repository;
    private final int maxPerRequest;
    private final Duration timeout;
    private final HttpClient httpClient;

    public StreamCheckService(
            ChannelRepository repository,
            @Value("${jakuy.streamcheck.max-per-request:50}") int maxPerRequest,
            @Value("${jakuy.streamcheck.timeout-ms:5000}") long timeoutMs) {
        this.repository = repository;
        this.maxPerRequest = maxPerRequest;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(timeoutMs))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Transactional
    public StreamCheckResultDto check(StreamCheckRequest request) {
        List<Channel> channels = resolveTargets(request);
        if (channels.isEmpty()) {
            return new StreamCheckResultDto(0, 0, 0);
        }

        ExecutorService executor = Executors.newFixedThreadPool(Math.min(channels.size(), 10));
        try {
            List<CompletableFuture<Boolean>> futures = channels.stream()
                    .map(channel -> CompletableFuture.supplyAsync(() -> probe(channel.getStreamUrl()), executor))
                    .toList();

            Instant now = Instant.now();
            int online = 0;
            for (int i = 0; i < channels.size(); i++) {
                boolean isOnline = futures.get(i).join();
                Channel channel = channels.get(i);
                channel.setOnline(isOnline);
                channel.setLastCheckedAt(now);
                if (isOnline) {
                    online++;
                }
            }
            repository.saveAll(channels);
            return new StreamCheckResultDto(channels.size(), online, channels.size() - online);
        } finally {
            executor.shutdown();
        }
    }

    private List<Channel> resolveTargets(StreamCheckRequest request) {
        int limit = request != null && request.limit() != null
                ? Math.min(request.limit(), maxPerRequest)
                : maxPerRequest;

        if (request != null && request.channelIds() != null && !request.channelIds().isEmpty()) {
            List<Long> ids = request.channelIds().stream().limit(limit).toList();
            return repository.findAllById(ids).stream()
                    .filter(c -> Countries.UZ_CODE.equalsIgnoreCase(c.getCountryCode()))
                    .toList();
        }

        return repository.findStalest(Countries.UZ_CODE, PageRequest.of(0, limit));
    }

    private boolean probe(String streamUrl) {
        if (streamUrl == null || streamUrl.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(streamUrl);
            HttpRequest head = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(timeout)
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .header("User-Agent", "JakuyTV/0.1")
                    .build();
            HttpResponse<Void> headResponse = httpClient.send(head, HttpResponse.BodyHandlers.discarding());
            if (isSuccess(headResponse.statusCode())) {
                return true;
            }
            return probeWithRange(uri);
        } catch (IllegalArgumentException ex) {
            return false;
        } catch (Exception ex) {
            return probeWithRangeSafely(streamUrl);
        }
    }

    private boolean probeWithRangeSafely(String streamUrl) {
        try {
            return probeWithRange(URI.create(streamUrl));
        } catch (Exception ex) {
            log.debug("Stream probe failed for {}: {}", streamUrl, ex.getMessage());
            return false;
        }
    }

    private boolean probeWithRange(URI uri) throws Exception {
        HttpRequest get = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(timeout)
                .GET()
                .header("Range", "bytes=0-1")
                .header("User-Agent", "JakuyTV/0.1")
                .build();
        HttpResponse<Void> response = httpClient.send(get, HttpResponse.BodyHandlers.discarding());
        return isSuccess(response.statusCode());
    }

    private boolean isSuccess(int status) {
        return status >= 200 && status < 400;
    }
}
