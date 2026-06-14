package com.jakuy.tv.channel;

import com.jakuy.tv.common.PageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService service;

    public ChannelController(ChannelService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<ChannelDto> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean online,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return service.list(category, online, page, size);
    }

    @GetMapping("/search")
    public PageResponse<ChannelDto> search(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return service.search(q, page, size);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return service.categories();
    }

    @GetMapping("/online")
    public List<ChannelDto> online() {
        return service.online();
    }

    @GetMapping("/{id}")
    public ChannelDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/{id}/stream")
    public StreamDto stream(@PathVariable Long id) {
        return service.stream(id);
    }
}
