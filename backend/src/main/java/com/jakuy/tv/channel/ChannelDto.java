package com.jakuy.tv.channel;

import java.time.Instant;

public record ChannelDto(
        Long id,
        String tvgId,
        String name,
        String country,
        String countryCode,
        String language,
        String category,
        String logoUrl,
        String streamUrl,
        boolean online,
        Instant lastCheckedAt
) {

    public static ChannelDto from(Channel channel) {
        return new ChannelDto(
                channel.getId(),
                channel.getTvgId(),
                channel.getName(),
                channel.getCountry(),
                channel.getCountryCode(),
                channel.getLanguage(),
                channel.getCategory(),
                channel.getLogoUrl(),
                channel.getStreamUrl(),
                channel.isOnline(),
                channel.getLastCheckedAt()
        );
    }
}
