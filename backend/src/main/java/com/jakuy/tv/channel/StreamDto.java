package com.jakuy.tv.channel;

public record StreamDto(
        Long channelId,
        String streamUrl,
        boolean online
) {
}
