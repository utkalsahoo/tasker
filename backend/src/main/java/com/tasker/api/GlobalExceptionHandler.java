package com.tasker.api;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
    return ResponseEntity.badRequest()
        .body(Map.of("timestamp", Instant.now(), "error", "validation", "message", exception.getMessage()));
  }

  @ExceptionHandler({IllegalArgumentException.class, EntityNotFoundException.class})
  public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException exception) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("timestamp", Instant.now(), "error", "bad_request", "message", exception.getMessage()));
  }
}
