package com.sm3Agro.SM3AgroERP.common.enums;

import java.util.List;

public record ApiErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldErrorDetail> details
) {}