package com.jakuy.tv.favorite;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByChannelId(Long channelId);

    boolean existsByChannelId(Long channelId);

    void deleteByChannelId(Long channelId);
}
