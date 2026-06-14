package com.jakuy.tv.importer;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class M3uParserTest {

    private final M3uParser parser = new M3uParser();

    @Test
    void parsesStandardEntry() {
        String content = """
                #EXTM3U
                #EXTINF:-1 tvg-id="Uzbekistan24.uz" tvg-name="Uzbekistan 24" tvg-logo="https://example.com/logo.png" group-title="News",Uzbekistan 24
                https://example.com/live.m3u8
                """;

        List<M3uChannelItem> items = parser.parse(content);

        assertThat(items).hasSize(1);
        M3uChannelItem item = items.get(0);
        assertThat(item.tvgId()).isEqualTo("Uzbekistan24.uz");
        assertThat(item.resolvedName()).isEqualTo("Uzbekistan 24");
        assertThat(item.logoUrl()).isEqualTo("https://example.com/logo.png");
        assertThat(item.groupTitle()).isEqualTo("News");
        assertThat(item.streamUrl()).isEqualTo("https://example.com/live.m3u8");
    }

    @Test
    void fallsBackToDisplayNameWhenTvgNameMissing() {
        String content = """
                #EXTINF:-1 tvg-id="Aqlvoy.uz@SD" tvg-logo="https://example.com/a.png" group-title="Kids",Aqlvoy
                https://stream.example/1205/mono.m3u8
                """;

        List<M3uChannelItem> items = parser.parse(content);

        assertThat(items).hasSize(1);
        assertThat(items.get(0).resolvedName()).isEqualTo("Aqlvoy");
    }

    @Test
    void ignoresVlcOptDirectivesBetweenExtinfAndUrl() {
        String content = """
                #EXTINF:-1 group-title="General",Some Channel
                #EXTVLCOPT:http-user-agent=Mozilla
                https://example.com/stream.m3u8
                """;

        List<M3uChannelItem> items = parser.parse(content);

        assertThat(items).hasSize(1);
        assertThat(items.get(0).streamUrl()).isEqualTo("https://example.com/stream.m3u8");
    }

    @Test
    void skipsInvalidEntriesWithoutCrashing() {
        String content = """
                #EXTINF:-1 tvg-id="Broken.uz" group-title="News",No URL Channel
                #EXTINF:-1 group-title="News",
                https://example.com/has-empty-name.m3u8
                #EXTINF:-1 tvg-id="Good.uz" group-title="News",Good Channel
                https://example.com/good.m3u8
                """;

        List<M3uChannelItem> items = parser.parse(content);

        assertThat(items).hasSize(1);
        assertThat(items.get(0).resolvedName()).isEqualTo("Good Channel");
    }

    @Test
    void handlesDisplayNameWithCommas() {
        String content = """
                #EXTINF:-1 tvg-id="News.uz" group-title="News",Channel, Live, HD
                https://example.com/comma.m3u8
                """;

        List<M3uChannelItem> items = parser.parse(content);

        assertThat(items).hasSize(1);
        assertThat(items.get(0).displayName()).isEqualTo("Channel, Live, HD");
    }

    @Test
    void returnsEmptyForBlankContent() {
        assertThat(parser.parse("")).isEmpty();
        assertThat(parser.parse(null)).isEmpty();
    }
}
