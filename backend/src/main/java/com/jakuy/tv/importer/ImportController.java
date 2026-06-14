package com.jakuy.tv.importer;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final M3uImporterService importerService;

    public ImportController(M3uImporterService importerService) {
        this.importerService = importerService;
    }

    @PostMapping("/uzbek-channels")
    public ImportResultDto importUzbekChannels() {
        return importerService.importUzbekChannels();
    }
}
