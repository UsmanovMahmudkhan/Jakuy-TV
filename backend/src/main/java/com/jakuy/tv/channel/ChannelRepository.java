package com.jakuy.tv.channel;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {

    Optional<Channel> findByTvgIdIgnoreCase(String tvgId);

    Optional<Channel> findByStreamUrl(String streamUrl);

    Page<Channel> findByCountryCode(String countryCode, Pageable pageable);

    Page<Channel> findByCountryCodeAndCategoryIgnoreCase(String countryCode, String category, Pageable pageable);

    Page<Channel> findByCountryCodeAndOnline(String countryCode, boolean online, Pageable pageable);

    Page<Channel> findByCountryCodeAndCategoryIgnoreCaseAndOnline(
            String countryCode, String category, boolean online, Pageable pageable);

    List<Channel> findByCountryCodeAndOnlineTrue(String countryCode);

    @Query("""
            select c from Channel c
            where c.countryCode = :countryCode and (
                lower(c.name) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.tvgId, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.category, '')) like lower(concat('%', :q, '%'))
                or lower(coalesce(c.language, '')) like lower(concat('%', :q, '%'))
            )
            """)
    Page<Channel> search(@Param("countryCode") String countryCode, @Param("q") String q, Pageable pageable);

    @Query("select distinct c.category from Channel c where c.countryCode = :countryCode and c.category is not null order by c.category")
    List<String> findDistinctCategories(@Param("countryCode") String countryCode);

    @Query("select c from Channel c where c.countryCode = :countryCode order by c.lastCheckedAt asc nulls first")
    List<Channel> findStalest(@Param("countryCode") String countryCode, Pageable pageable);
}
