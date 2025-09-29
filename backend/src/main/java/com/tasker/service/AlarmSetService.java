package com.tasker.service;

import com.tasker.api.dto.AlarmSetDtos.AlarmSetRequest;
import com.tasker.api.dto.AlarmSetDtos.AlarmSetResponse;
import com.tasker.domain.AlarmSet;
import com.tasker.domain.User;
import com.tasker.repository.AlarmSetRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AlarmSetService {
  private final AlarmSetRepository alarmSetRepository;
  private final SchedulingService schedulingService;

  public AlarmSetService(AlarmSetRepository alarmSetRepository, SchedulingService schedulingService) {
    this.alarmSetRepository = alarmSetRepository;
    this.schedulingService = schedulingService;
  }

  @Transactional
  public AlarmSetResponse create(User user, AlarmSetRequest request) {
    AlarmSet alarmSet = mapToEntity(new AlarmSet(), user, request);
    AlarmSet saved = alarmSetRepository.save(alarmSet);
    schedulingService.scheduleAlarmSet(saved);
    return mapToResponse(saved);
  }

  @Transactional
  public AlarmSetResponse update(User user, Long id, AlarmSetRequest request) {
    AlarmSet alarmSet =
        alarmSetRepository
            .findById(id)
            .filter(a -> a.getUser().getId().equals(user.getId()))
            .orElseThrow(EntityNotFoundException::new);
    mapToEntity(alarmSet, user, request);
    AlarmSet saved = alarmSetRepository.save(alarmSet);
    schedulingService.scheduleAlarmSet(saved);
    return mapToResponse(saved);
  }

  @Transactional
  public void delete(User user, Long id) {
    alarmSetRepository
        .findById(id)
        .filter(a -> a.getUser().getId().equals(user.getId()))
        .ifPresent(
            alarmSet -> {
              alarmSetRepository.delete(alarmSet);
              schedulingService.cancelAlarmSet(alarmSet.getId());
            });
  }

  public List<AlarmSetResponse> findAll(User user) {
    return alarmSetRepository.findByUser(user).stream().map(this::mapToResponse).collect(Collectors.toList());
  }

  @Transactional
  public void trigger(User user, Long id) {
    AlarmSet alarmSet =
        alarmSetRepository
            .findById(id)
            .filter(a -> a.getUser().getId().equals(user.getId()))
            .orElseThrow(EntityNotFoundException::new);
    schedulingService.scheduleAlarmSet(alarmSet);
  }

  private AlarmSet mapToEntity(AlarmSet alarmSet, User user, AlarmSetRequest request) {
    alarmSet.setUser(user);
    alarmSet.setName(request.name());
    alarmSet.setTimeUtc(request.timeUtc());
    alarmSet.setTimezone(request.timezone());
    alarmSet.setTaskIds(request.taskIds() != null ? new java.util.ArrayList<>(request.taskIds()) : new java.util.ArrayList<>());
    Instant now = Instant.now();
    if (alarmSet.getId() == null) {
      alarmSet.setCreatedAt(now);
    }
    alarmSet.setUpdatedAt(now);
    return alarmSet;
  }

  private AlarmSetResponse mapToResponse(AlarmSet alarmSet) {
    return new AlarmSetResponse(
        alarmSet.getId(),
        alarmSet.getName(),
        alarmSet.getTimeUtc(),
        alarmSet.getTimezone(),
        alarmSet.getTaskIds(),
        alarmSet.getCreatedAt(),
        alarmSet.getUpdatedAt());
  }
}
