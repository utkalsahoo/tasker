package com.tasker.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(@Email String email, @Size(min = 8, max = 64) String password) {}

  public record LoginRequest(@Email String email, @NotBlank String password) {}

  public record RefreshRequest(@NotBlank String refreshToken) {}

  public record TokenResponse(String accessToken, String refreshToken, long expiresIn, Long userId) {}
}
