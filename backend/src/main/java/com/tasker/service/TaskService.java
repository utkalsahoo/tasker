package com.tasker.service;

import com.tasker.api.dto.TaskDtos.TaskPage;
import com.tasker.api.dto.TaskDtos.TaskRequest;
import com.tasker.api.dto.TaskDtos.TaskResponse;
import com.tasker.domain.Task;
import com.tasker.domain.User;
import com.tasker.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
  private final TaskRepository taskRepository;
  private final SchedulingService schedulingService;

  public TaskService(TaskRepository taskRepository, SchedulingService schedulingService) {
    this.taskRepository = taskRepository;
    this.schedulingService = schedulingService;
  }

  @Transactional
  public TaskResponse createTask(User user, TaskRequest request) {
    Task task = mapToTask(new Task(), user, request);
    Task saved = taskRepository.save(task);
    schedulingService.scheduleTaskReminder(saved);
    return mapToResponse(saved);
  }

  @Transactional
  public TaskResponse updateTask(User user, Long id, TaskRequest request) {
    Task task =
        taskRepository.findById(id).filter(t -> t.getUser().getId().equals(user.getId())).orElseThrow(EntityNotFoundException::new);
    mapToTask(task, user, request);
    Task saved = taskRepository.save(task);
    schedulingService.scheduleTaskReminder(saved);
    return mapToResponse(saved);
  }

  @Transactional
  public void deleteTask(User user, Long id) {
    taskRepository
        .findById(id)
        .filter(t -> t.getUser().getId().equals(user.getId()))
        .ifPresent(
            task -> {
              taskRepository.delete(task);
              schedulingService.cancelTaskReminder(task.getId());
            });
  }

  @Transactional
  public TaskResponse completeTask(User user, Long id) {
    Task task =
        taskRepository.findById(id).filter(t -> t.getUser().getId().equals(user.getId())).orElseThrow(EntityNotFoundException::new);
    task.setStatus(Task.Status.COMPLETED);
    task.setUpdatedAt(Instant.now());
    Task saved = taskRepository.save(task);
    schedulingService.cancelTaskReminder(saved.getId());
    return mapToResponse(saved);
  }

  @Transactional
  public TaskResponse snoozeTask(User user, Long id, int minutes) {
    Task task =
        taskRepository.findById(id).filter(t -> t.getUser().getId().equals(user.getId())).orElseThrow(EntityNotFoundException::new);
    Instant base = task.getRemindAt() != null ? task.getRemindAt() : Instant.now();
    task.setRemindAt(base.plusSeconds(minutes * 60L));
    Task saved = taskRepository.save(task);
    schedulingService.scheduleTaskReminder(saved);
    return mapToResponse(saved);
  }

  public TaskResponse getTask(User user, Long id) {
    Task task =
        taskRepository.findById(id).filter(t -> t.getUser().getId().equals(user.getId())).orElseThrow(EntityNotFoundException::new);
    return mapToResponse(task);
  }

  public TaskPage getTasks(User user, int page, int size) {
    Page<Task> taskPage = taskRepository.findAllByUser(user, PageRequest.of(page, size));
    List<TaskResponse> responses = taskPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
    return new TaskPage(responses, taskPage.getTotalElements());
  }

  private Task mapToTask(Task task, User user, TaskRequest request) {
    task.setUser(user);
    task.setTitle(request.title());
    task.setDescription(request.description());
    task.setPriority(request.priority() != null ? request.priority() : Task.Priority.MEDIUM);
    task.setStatus(request.status() != null ? request.status() : Task.Status.PENDING);
    task.setDueAt(request.dueAt());
    if (request.remindAt() != null && request.dueAt() != null && request.remindAt().isAfter(request.dueAt())) {
      throw new IllegalArgumentException("Reminder must be before due date");
    }
    task.setRemindAt(request.remindAt());
    task.setRepeat(request.repeat() != null ? request.repeat() : Task.RepeatType.NONE);
    task.setRepeatCron(request.repeatCron());
    task.setAlarm(request.alarm());
    task.setTags(request.tags() != null ? new java.util.ArrayList<>(request.tags()) : new java.util.ArrayList<>());
    Instant now = Instant.now();
    if (task.getId() == null) {
      task.setCreatedAt(now);
    }
    task.setUpdatedAt(now);
    return task;
  }

  private TaskResponse mapToResponse(Task task) {
    return new TaskResponse(
        task.getId(),
        task.getTitle(),
        task.getDescription(),
        task.getPriority(),
        task.getStatus(),
        task.getDueAt(),
        task.getRemindAt(),
        task.getRepeat(),
        task.getRepeatCron(),
        task.isAlarm(),
        task.getTags(),
        task.getCreatedAt(),
        task.getUpdatedAt());
  }
}
