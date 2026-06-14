package com.jakuy.tv.streamcheck;

public record StreamCheckResultDto(
        int checked,
        int online,
        int offline
) {
}
