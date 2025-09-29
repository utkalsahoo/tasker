package com.tasker.quartz;

import com.tasker.domain.Task;
import com.tasker.repository.TaskRepository;
import com.tasker.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TaskReminderJob extends QuartzJobBean {
  public static final String TASK_ID = "taskId";

  @Autowired private TaskRepository taskRepository;
  @Autowired private NotificationService notificationService;

  @Override
  @Transactional
  protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
    Long taskId = context.getMergedJobDataMap().getLong(TASK_ID);
    Task task = taskRepository.findById(taskId).orElseThrow(EntityNotFoundException::new);
    notificationService.sendTaskReminder(task.getUser(), task);
    task.setUpdatedAt(Instant.now());
    taskRepository.save(task);
  }
}
