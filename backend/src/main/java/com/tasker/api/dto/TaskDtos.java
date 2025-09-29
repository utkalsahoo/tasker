package com.tasker.api.dto;

import com.tasker.domain.Task.Priority;
import com.tasker.domain.Task.RepeatType;
import com.tasker.domain.Task.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public class TaskDtos {
  public record TaskRequest(
      @NotBlank @Size(max = 255) String title,
      @Size(max = 1000) String description,
      Priority priority,
      Status status,
      Instant dueAt,
      Instant remindAt,
      RepeatType repeat,
      String repeatCron,
      boolean alarm,
      List<String> tags) {}

  public record SnoozeRequest(int minutes) {}

  public record TaskResponse(
      Long id,
      String title,
      String description,
      Priority priority,
      Status status,
      Instant dueAt,
      Instant remindAt,
      RepeatType repeat,
      String repeatCron,
      boolean alarm,
      List<String> tags,
      Instant createdAt,
      Instant updatedAt) {}

  public record TaskPage(List<TaskResponse> items, long total) {}
}
