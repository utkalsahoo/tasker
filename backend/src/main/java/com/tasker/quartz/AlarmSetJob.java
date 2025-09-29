package com.tasker.quartz;

import com.tasker.domain.AlarmSet;
import com.tasker.repository.AlarmSetRepository;
import com.tasker.repository.TaskRepository;
import com.tasker.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AlarmSetJob extends QuartzJobBean {
  public static final String ALARM_SET_ID = "alarmSetId";

  @Autowired private AlarmSetRepository alarmSetRepository;
  @Autowired private TaskRepository taskRepository;
  @Autowired private NotificationService notificationService;

  @Override
  @Transactional
  protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
    Long alarmSetId = context.getMergedJobDataMap().getLong(ALARM_SET_ID);
    AlarmSet alarmSet = alarmSetRepository.findById(alarmSetId).orElseThrow(EntityNotFoundException::new);
    List<Long> taskIds = alarmSet.getTaskIds();
    taskRepository
        .findAllById(taskIds)
        .forEach(task -> notificationService.sendTaskReminder(task.getUser(), task));
    alarmSet.setUpdatedAt(Instant.now());
    alarmSetRepository.save(alarmSet);
  }
}
