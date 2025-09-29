package com.tasker.api;

import com.tasker.domain.PushSubscription;
import com.tasker.service.PushService;
import com.tasker.service.UserService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push")
public class PushController {
  private final PushService pushService;
  private final UserService userService;

  public PushController(PushService pushService, UserService userService) {
    this.pushService = pushService;
    this.userService = userService;
  }

  public record SubscribeRequest(@NotBlank String deviceId, @NotBlank String fcmToken, @NotBlank String platform) {}

  @PostMapping("/subscribe")
  public ResponseEntity<PushSubscription> subscribe(
      @AuthenticationPrincipal(expression = "username") String userId,
      @RequestBody @jakarta.validation.Valid SubscribeRequest request) {
    return ResponseEntity.ok(
        pushService.subscribe(
            userService.requireUser(Long.parseLong(userId)), request.deviceId(), request.fcmToken(), request.platform()));
  }

  @PostMapping("/test")
  public ResponseEntity<Void> sendTest(
      @AuthenticationPrincipal(expression = "username") String userId,
      @RequestBody @jakarta.validation.Valid SubscribeRequest request) {
    pushService.sendTest(
        userService.requireUser(Long.parseLong(userId)), request.deviceId(), request.fcmToken(), request.platform());
    return ResponseEntity.accepted().build();
  }
}
