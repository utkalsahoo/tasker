package com.tasker;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tasker.api.dto.TaskDtos.TaskRequest;
import com.tasker.domain.Task;
import com.tasker.domain.User;
import com.tasker.repository.TaskRepository;
import com.tasker.service.SchedulingService;
import com.tasker.service.TaskService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class TaskServiceTest {
  @Mock private TaskRepository taskRepository;
  @Mock private SchedulingService schedulingService;

  private TaskService taskService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    taskService = new TaskService(taskRepository, schedulingService);
  }

  @Test
  void createsTask() {
    User user = new User();
    user.setId(1L);
    TaskRequest request =
        new TaskRequest(
            "Test",
            "Desc",
            Task.Priority.MEDIUM,
            Task.Status.PENDING,
            Instant.now().plusSeconds(3600),
            Instant.now().plusSeconds(1800),
            Task.RepeatType.NONE,
            null,
            false,
            List.of("home"));
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(invocation -> {
          Task task = invocation.getArgument(0);
          task.setId(10L);
          return task;
        });

    var response = taskService.createTask(user, request);

    assertThat(response.id()).isEqualTo(10L);
    ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
    verify(taskRepository).save(captor.capture());
    assertThat(captor.getValue().getTitle()).isEqualTo("Test");
    verify(schedulingService).scheduleTaskReminder(any(Task.class));
  }
}
