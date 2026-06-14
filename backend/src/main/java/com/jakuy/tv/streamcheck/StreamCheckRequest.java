package com.jakuy.tv.streamcheck;

import jakarta.validation.constraints.Positive;

import java.util.List;

public record StreamCheckRequest(
        List<Long> channelIds,
        @Positive Integer limit
) {
}
