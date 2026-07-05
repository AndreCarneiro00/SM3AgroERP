package com.sm3Agro.SM3AgroERP.common.exception;

import com.sm3Agro.SM3AgroERP.common.enums.ApiErrorResponse;
import com.sm3Agro.SM3AgroERP.common.enums.FieldErrorDetail;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final Environment environment;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        List<FieldErrorDetail> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> new FieldErrorDetail(
                        err.getField(),
                        err.getDefaultMessage()
                ))
                .toList();

        log.warn("Validation error on {} {}: {}", request.getMethod(), request.getRequestURI(), errors);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Validation error",
                request.getRequestURI(),
                errors,
                ex
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {

        log.warn("Invalid request body on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid request body (JSON or enum format error)",
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            EntityNotFoundException ex,
            HttpServletRequest request
    ) {

        log.warn("Resource not found on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessError(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {

        log.warn("Business rule error on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request
    ) {

        List<FieldErrorDetail> errors = ex.getConstraintViolations()
                .stream()
                .map(violation -> new FieldErrorDetail(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()
                ))
                .toList();

        log.warn("Constraint violation on {} {}: {}", request.getMethod(), request.getRequestURI(), errors);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Validation error",
                request.getRequestURI(),
                errors,
                ex
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request
    ) {

        log.warn("Type mismatch on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid parameter type",
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request
    ) {

        log.warn("Data integrity violation on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.CONFLICT,
                "Data integrity violation",
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request
    ) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        log.warn("Response status exception on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getReason(), ex);

        return buildResponse(
                status,
                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleRouteNotFound(
            Exception ex,
            HttpServletRequest request
    ) {

        log.warn("Route not found on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.NOT_FOUND,
                "Resource not found",
                request.getRequestURI(),
                null,
                ex
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request
    ) {

        log.error("Unexpected error on {} {}", request.getMethod(), request.getRequestURI(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error",
                request.getRequestURI(),
                null,
                ex
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            String path,
            List<FieldErrorDetail> details,
            Exception ex
    ) {

        boolean includeTrace = shouldIncludeTrace();

        ApiErrorResponse body = new ApiErrorResponse(
                LocalDateTime.now().toString(),
                status.value(),
                status.name(),
                message,
                path,
                details,
                includeTrace ? ex.getClass().getName() : null,
                includeTrace ? stackTraceOf(ex) : null
        );

        return ResponseEntity.status(status).body(body);
    }

    private boolean shouldIncludeTrace() {
        return environment.matchesProfiles("dev", "test");
    }

    private String stackTraceOf(Exception ex) {
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        ex.printStackTrace(printWriter);
        return stringWriter.toString();
    }
}
