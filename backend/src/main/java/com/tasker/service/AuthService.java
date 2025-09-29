package com.tasker.service;

import com.tasker.api.dto.AuthDtos.LoginRequest;
import com.tasker.api.dto.AuthDtos.RegisterRequest;
import com.tasker.api.dto.AuthDtos.TokenResponse;
import com.tasker.domain.RefreshToken;
import com.tasker.domain.User;
import com.tasker.repository.RefreshTokenRepository;
import com.tasker.repository.UserRepository;
import com.tasker.security.JwtService;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final long refreshTokenTtl;
  private final long accessTokenTtl;

  public AuthService(
      UserRepository userRepository,
      RefreshTokenRepository refreshTokenRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      @org.springframework.beans.factory.annotation.Value("${jwt.refresh-token-ttl}") long refreshTokenTtl,
      @org.springframework.beans.factory.annotation.Value("${jwt.access-token-ttl}") long accessTokenTtl) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.refreshTokenTtl = refreshTokenTtl;
    this.accessTokenTtl = accessTokenTtl;
  }

  @Transactional
  public TokenResponse register(RegisterRequest request) {
    userRepository
        .findByEmail(request.email())
        .ifPresent(existing -> {
          throw new IllegalArgumentException("Email already registered");
        });
    User user = new User();
    user.setEmail(request.email());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    userRepository.save(user);
    return issueTokens(user);
  }

  @Transactional
  public TokenResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByEmail(request.email())
            .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    return issueTokens(user);
  }

  @Transactional
  public TokenResponse refresh(String refreshToken) {
    RefreshToken token =
        refreshTokenRepository
            .findByToken(refreshToken)
            .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
    refreshTokenRepository.delete(token);
    return issueTokens(token.getUser());
  }

  private TokenResponse issueTokens(User user) {
    String accessToken = jwtService.generateToken(user.getId());
    RefreshToken refreshToken = RefreshToken.create(user, Instant.now().plus(refreshTokenTtl, ChronoUnit.SECONDS));
    refreshTokenRepository.save(refreshToken);
    return new TokenResponse(accessToken, refreshToken.getToken(), accessTokenTtl, user.getId());
  }
}
