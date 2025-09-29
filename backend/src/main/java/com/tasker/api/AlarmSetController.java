package com.tasker.api;

import com.tasker.api.dto.AlarmSetDtos.AlarmSetRequest;
import com.tasker.api.dto.AlarmSetDtos.AlarmSetResponse;
import com.tasker.service.AlarmSetService;
import com.tasker.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alarm-sets")
public class AlarmSetController {
  private final AlarmSetService alarmSetService;
  private final UserService userService;

  public AlarmSetController(AlarmSetService alarmSetService, UserService userService) {
    this.alarmSetService = alarmSetService;
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<List<AlarmSetResponse>> list(
      @AuthenticationPrincipal(expression = "username") String userId) {
    return ResponseEntity.ok(alarmSetService.findAll(userService.requireUser(Long.parseLong(userId))));
  }

  @PostMapping
  public ResponseEntity<AlarmSetResponse> create(
      @AuthenticationPrincipal(expression = "username") String userId,
      @Valid @RequestBody AlarmSetRequest request) {
    return ResponseEntity.ok(alarmSetService.create(userService.requireUser(Long.parseLong(userId)), request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<AlarmSetResponse> update(
      @AuthenticationPrincipal(expression = "username") String userId,
      @PathVariable Long id,
      @Valid @RequestBody AlarmSetRequest request) {
    return ResponseEntity.ok(alarmSetService.update(userService.requireUser(Long.parseLong(userId)), id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @AuthenticationPrincipal(expression = "username") String userId, @PathVariable Long id) {
    alarmSetService.delete(userService.requireUser(Long.parseLong(userId)), id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/trigger")
  public ResponseEntity<Void> trigger(
      @AuthenticationPrincipal(expression = "username") String userId, @PathVariable Long id) {
    alarmSetService.trigger(userService.requireUser(Long.parseLong(userId)), id);
    return ResponseEntity.accepted().build();
  }
}
