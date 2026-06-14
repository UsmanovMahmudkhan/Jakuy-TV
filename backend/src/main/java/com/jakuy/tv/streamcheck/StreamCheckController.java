package com.jakuy.tv.streamcheck;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streams")
public class StreamCheckController {

    private final StreamCheckService service;

    public StreamCheckController(StreamCheckService service) {
        this.service = service;
    }

    @PostMapping("/check")
    public StreamCheckResultDto check(@Valid @RequestBody(required = false) StreamCheckRequest request) {
        return service.check(request);
    }
}
