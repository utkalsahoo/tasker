package com.tasker.service;

import com.tasker.domain.AlarmSet;
import com.tasker.domain.Task;
import com.tasker.quartz.AlarmSetJob;
import com.tasker.quartz.TaskReminderJob;
import java.time.Instant;
import java.util.Date;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.stereotype.Service;

@Service
public class SchedulingService {
  private final Scheduler scheduler;

  public SchedulingService(Scheduler scheduler) {
    this.scheduler = scheduler;
  }

  public void scheduleTaskReminder(Task task) {
    if (task.getRemindAt() == null) {
      return;
    }
    try {
      JobDetail jobDetail =
          JobBuilder.newJob(TaskReminderJob.class)
              .withIdentity("task-" + task.getId())
              .usingJobData(TaskReminderJob.TASK_ID, task.getId())
              .build();
      scheduler.deleteJob(jobDetail.getKey());
      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity("trigger-task-" + task.getId())
              .startAt(Date.from(task.getRemindAt()))
              .withSchedule(SimpleScheduleBuilder.simpleSchedule())
              .build();
      scheduler.scheduleJob(jobDetail, trigger);
    } catch (SchedulerException e) {
      throw new IllegalStateException("Failed to schedule task reminder", e);
    }
  }

  public void cancelTaskReminder(Long taskId) {
    try {
      scheduler.deleteJob(JobBuilder.newJob(TaskReminderJob.class).withIdentity("task-" + taskId).build().getKey());
    } catch (SchedulerException e) {
      throw new IllegalStateException("Failed to cancel task reminder", e);
    }
  }

  public void scheduleAlarmSet(AlarmSet alarmSet) {
    try {
      JobDetail jobDetail =
          JobBuilder.newJob(AlarmSetJob.class)
              .withIdentity("alarm-" + alarmSet.getId())
              .usingJobData(AlarmSetJob.ALARM_SET_ID, alarmSet.getId())
              .build();
      scheduler.deleteJob(jobDetail.getKey());
      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity("trigger-alarm-" + alarmSet.getId())
              .startAt(Date.from(alarmSet.getTimeUtc()))
              .withSchedule(SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
              .build();
      scheduler.scheduleJob(jobDetail, trigger);
    } catch (SchedulerException e) {
      throw new IllegalStateException("Failed to schedule alarm set", e);
    }
  }

  public void cancelAlarmSet(Long alarmSetId) {
    try {
      scheduler.deleteJob(JobBuilder.newJob(AlarmSetJob.class).withIdentity("alarm-" + alarmSetId).build().getKey());
    } catch (SchedulerException e) {
      throw new IllegalStateException("Failed to cancel alarm set", e);
    }
  }
}
