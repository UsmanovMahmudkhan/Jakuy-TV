package com.jakuy.tv.favorite;

import com.jakuy.tv.channel.ChannelDto;

import java.time.Instant;

public record FavoriteDto(
        Long id,
        Long channelId,
        Instant createdAt,
        ChannelDto channel
) {
}
