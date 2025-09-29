package com.tasker;

import static org.assertj.core.api.Assertions.assertThat;

import com.tasker.api.dto.AuthDtos.RegisterRequest;
import com.tasker.repository.RefreshTokenRepository;
import com.tasker.repository.UserRepository;
import com.tasker.security.JwtService;
import com.tasker.service.AuthService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

public class AuthServiceTest {
  private UserRepository userRepository;
  private RefreshTokenRepository refreshTokenRepository;
  private PasswordEncoder passwordEncoder;
  private JwtService jwtService;
  private AuthService authService;

  @BeforeEach
  void setUp() {
    userRepository = Mockito.mock(UserRepository.class);
    refreshTokenRepository = Mockito.mock(RefreshTokenRepository.class);
    passwordEncoder = Mockito.mock(PasswordEncoder.class);
    jwtService = Mockito.mock(JwtService.class);
    Mockito.when(jwtService.generateToken(Mockito.anyLong())).thenReturn("token");
    authService = new AuthService(userRepository, refreshTokenRepository, passwordEncoder, jwtService, 3600, 900);
  }

  @Test
  void registersUser() {
    Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("hash");
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(java.util.Optional.empty());
    var response = authService.register(new RegisterRequest("user@example.com", "password123"));
    assertThat(response.accessToken()).isEqualTo("token");
  }
}
