package com.tasker.api;

import com.tasker.api.dto.TaskDtos.SnoozeRequest;
import com.tasker.api.dto.TaskDtos.TaskPage;
import com.tasker.api.dto.TaskDtos.TaskRequest;
import com.tasker.api.dto.TaskDtos.TaskResponse;
import com.tasker.service.TaskService;
import com.tasker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
  private final TaskService taskService;
  private final UserService userService;

  public TaskController(TaskService taskService, UserService userService) {
    this.taskService = taskService;
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<TaskPage> list(
      @AuthenticationPrincipal(expression = "username") String userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(taskService.getTasks(userService.requireUser(Long.parseLong(userId)), page, size));
  }

  @PostMapping
  public ResponseEntity<TaskResponse> create(
      @AuthenticationPrincipal(expression = "username") String userId,
      @Valid @RequestBody TaskRequest request) {
    return ResponseEntity.ok(taskService.createTask(userService.requireUser(Long.parseLong(userId)), request));
  }

  @GetMapping("/{id}")
  public ResponseEntity<TaskResponse> get(
      @AuthenticationPrincipal(expression = "username") String userId, @PathVariable Long id) {
    return ResponseEntity.ok(taskService.getTask(userService.requireUser(Long.parseLong(userId)), id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<TaskResponse> update(
      @AuthenticationPrincipal(expression = "username") String userId,
      @PathVariable Long id,
      @Valid @RequestBody TaskRequest request) {
    return ResponseEntity.ok(taskService.updateTask(userService.requireUser(Long.parseLong(userId)), id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @AuthenticationPrincipal(expression = "username") String userId, @PathVariable Long id) {
    taskService.deleteTask(userService.requireUser(Long.parseLong(userId)), id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/complete")
  public ResponseEntity<TaskResponse> complete(
      @AuthenticationPrincipal(expression = "username") String userId, @PathVariable Long id) {
    return ResponseEntity.ok(taskService.completeTask(userService.requireUser(Long.parseLong(userId)), id));
  }

  @PostMapping("/{id}/snooze")
  public ResponseEntity<TaskResponse> snooze(
      @AuthenticationPrincipal(expression = "username") String userId,
      @PathVariable Long id,
      @RequestBody SnoozeRequest request) {
    return ResponseEntity.ok(
        taskService.snoozeTask(userService.requireUser(Long.parseLong(userId)), id, request.minutes()));
  }
}
