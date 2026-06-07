package com.qloudprint.qloudprint_backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TempUploadResponse {

    private String fileUrl;

    private String fileName;

    private Integer pageCount;
}