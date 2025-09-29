package com.tasker.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

public class AlarmSetDtos {
  public record AlarmSetRequest(@NotBlank String name, Instant timeUtc, String timezone, List<Long> taskIds) {}

  public record AlarmSetResponse(
      Long id, String name, Instant timeUtc, String timezone, List<Long> taskIds, Instant createdAt, Instant updatedAt) {}
}
