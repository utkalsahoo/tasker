package com.tasker.api;

import com.tasker.api.dto.AuthDtos.LoginRequest;
import com.tasker.api.dto.AuthDtos.RegisterRequest;
import com.tasker.api.dto.AuthDtos.RefreshRequest;
import com.tasker.api.dto.AuthDtos.TokenResponse;
import com.tasker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<TokenResponse> register(@RequestBody @Valid RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/refresh")
  public ResponseEntity<TokenResponse> refresh(@RequestBody @Valid RefreshRequest refreshRequest) {
    return ResponseEntity.ok(authService.refresh(refreshRequest.refreshToken()));
  }
}
