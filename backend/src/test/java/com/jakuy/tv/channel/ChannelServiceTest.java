package com.jakuy.tv.channel;

import com.jakuy.tv.common.Countries;
import com.jakuy.tv.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChannelServiceTest {

    @Mock
    private ChannelRepository repository;

    @InjectMocks
    private ChannelService service;

    @Test
    void clampsOversizedPageSizeToMaximum() {
        when(repository.findByCountryCode(eq(Countries.UZ_CODE), any(Pageable.class)))
                .thenReturn(Page.empty());

        service.list(null, null, 0, 10_000);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(repository).findByCountryCode(eq(Countries.UZ_CODE), captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(200);
    }

    @Test
    void clampsNegativePageAndSizeToSafeDefaults() {
        when(repository.findByCountryCode(eq(Countries.UZ_CODE), any(Pageable.class)))
                .thenReturn(Page.empty());

        service.list(null, null, -5, -1);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(repository).findByCountryCode(eq(Countries.UZ_CODE), captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(0);
        assertThat(captor.getValue().getPageSize()).isEqualTo(1);
    }

    @Test
    void blankSearchFallsBackToListing() {
        when(repository.findByCountryCode(eq(Countries.UZ_CODE), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        var result = service.search("   ", 0, 50);

        assertThat(result.content()).isEmpty();
    }

    @Test
    void getByIdRejectsNonUzbekChannel() {
        Channel foreign = new Channel();
        foreign.setCountryCode("RU");
        when(repository.findById(99L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getByIdThrowsWhenMissing() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(1L))
                .isInstanceOf(NotFoundException.class);
    }
}
