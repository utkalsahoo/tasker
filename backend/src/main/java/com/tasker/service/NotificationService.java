package com.tasker.service;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.tasker.domain.Task;
import com.tasker.domain.User;
import com.tasker.repository.PushSubscriptionRepository;
import java.util.concurrent.ExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
  private final PushSubscriptionRepository pushSubscriptionRepository;

  public NotificationService(PushSubscriptionRepository pushSubscriptionRepository) {
    this.pushSubscriptionRepository = pushSubscriptionRepository;
  }

  public void sendTaskReminder(User user, Task task) {
    pushSubscriptionRepository.findByUser(user).forEach(subscription -> {
      try {
        Message message =
            Message.builder()
                .setToken(subscription.getFcmToken())
                .setNotification(
                    Notification.builder()
                        .setTitle(task != null ? task.getTitle() : "Tasker notification")
                        .setBody(task != null ? task.getDescription() : "Push channel verified")
                        .build())
                .putData("taskId", task != null ? task.getId().toString() : "test")
                .setAndroidConfig(
                    AndroidConfig.builder()
                        .setNotification(
                            AndroidNotification.builder()
                                .setChannelId(task != null && task.isAlarm() ? "alarms" : "reminders")
                                .build())
                        .build())
                .build();
        FirebaseMessaging.getInstance().sendAsync(message).get();
      } catch (InterruptedException | ExecutionException e) {
        Thread.currentThread().interrupt();
        log.warn("Failed to send push notification", e);
      }
    });
  }
}
