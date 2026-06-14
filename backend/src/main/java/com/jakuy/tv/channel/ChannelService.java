package com.jakuy.tv.channel;

import com.jakuy.tv.common.Countries;
import com.jakuy.tv.common.PageResponse;
import com.jakuy.tv.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class ChannelService {

    private static final int MAX_PAGE_SIZE = 200;

    private final ChannelRepository repository;

    public ChannelService(ChannelRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ChannelDto> list(String category, Boolean online, int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Channel> result;

        boolean hasCategory = StringUtils.hasText(category);
        if (hasCategory && online != null) {
            result = repository.findByCountryCodeAndCategoryIgnoreCaseAndOnline(
                    Countries.UZ_CODE, category, online, pageable);
        } else if (hasCategory) {
            result = repository.findByCountryCodeAndCategoryIgnoreCase(Countries.UZ_CODE, category, pageable);
        } else if (online != null) {
            result = repository.findByCountryCodeAndOnline(Countries.UZ_CODE, online, pageable);
        } else {
            result = repository.findByCountryCode(Countries.UZ_CODE, pageable);
        }

        return PageResponse.of(result, ChannelDto::from);
    }

    @Transactional(readOnly = true)
    public ChannelDto getById(Long id) {
        return ChannelDto.from(findUzbekOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ChannelDto> search(String query, int page, int size) {
        if (!StringUtils.hasText(query)) {
            return list(null, null, page, size);
        }
        Page<Channel> result = repository.search(Countries.UZ_CODE, query.trim(), pageable(page, size));
        return PageResponse.of(result, ChannelDto::from);
    }

    @Transactional(readOnly = true)
    public List<String> categories() {
        return repository.findDistinctCategories(Countries.UZ_CODE);
    }

    @Transactional(readOnly = true)
    public List<ChannelDto> online() {
        return repository.findByCountryCodeAndOnlineTrue(Countries.UZ_CODE)
                .stream()
                .map(ChannelDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StreamDto stream(Long id) {
        Channel channel = findUzbekOrThrow(id);
        return new StreamDto(channel.getId(), channel.getStreamUrl(), channel.isOnline());
    }

    private Channel findUzbekOrThrow(Long id) {
        Channel channel = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Channel not found: " + id));
        if (!Countries.UZ_CODE.equalsIgnoreCase(channel.getCountryCode())) {
            throw new NotFoundException("Channel not found: " + id);
        }
        return channel;
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "name"));
    }
}
