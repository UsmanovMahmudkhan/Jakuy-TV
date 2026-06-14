package com.jakuy.tv.favorite;

import com.jakuy.tv.channel.Channel;
import com.jakuy.tv.channel.ChannelDto;
import com.jakuy.tv.channel.ChannelRepository;
import com.jakuy.tv.common.Countries;
import com.jakuy.tv.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ChannelRepository channelRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, ChannelRepository channelRepository) {
        this.favoriteRepository = favoriteRepository;
        this.channelRepository = channelRepository;
    }

    @Transactional(readOnly = true)
    public List<FavoriteDto> list() {
        List<Favorite> favorites = favoriteRepository.findAll();
        Map<Long, Channel> channels = channelRepository.findAllById(
                        favorites.stream().map(Favorite::getChannelId).toList())
                .stream()
                .collect(Collectors.toMap(Channel::getId, Function.identity()));

        return favorites.stream()
                .sorted(Comparator.comparing(Favorite::getCreatedAt).reversed())
                .map(favorite -> toDto(favorite, channels.get(favorite.getChannelId())))
                .toList();
    }

    @Transactional
    public FavoriteDto add(Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .filter(c -> Countries.UZ_CODE.equalsIgnoreCase(c.getCountryCode()))
                .orElseThrow(() -> new NotFoundException("Channel not found: " + channelId));

        Favorite favorite = favoriteRepository.findByChannelId(channelId)
                .orElseGet(() -> favoriteRepository.save(new Favorite(channelId)));

        return toDto(favorite, channel);
    }

    @Transactional
    public void remove(Long channelId) {
        if (!favoriteRepository.existsByChannelId(channelId)) {
            throw new NotFoundException("Favorite not found for channel: " + channelId);
        }
        favoriteRepository.deleteByChannelId(channelId);
    }

    private FavoriteDto toDto(Favorite favorite, Channel channel) {
        ChannelDto channelDto = channel == null ? null : ChannelDto.from(channel);
        return new FavoriteDto(favorite.getId(), favorite.getChannelId(), favorite.getCreatedAt(), channelDto);
    }
}
