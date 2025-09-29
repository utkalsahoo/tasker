package com.tasker.service;

import com.tasker.domain.PushSubscription;
import com.tasker.domain.User;
import com.tasker.repository.PushSubscriptionRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class PushService {
  private final PushSubscriptionRepository pushSubscriptionRepository;
  private final NotificationService notificationService;

  public PushService(
      PushSubscriptionRepository pushSubscriptionRepository, NotificationService notificationService) {
    this.pushSubscriptionRepository = pushSubscriptionRepository;
    this.notificationService = notificationService;
  }

  @Transactional
  public PushSubscription subscribe(User user, String deviceId, String fcmToken, String platform) {
    PushSubscription subscription = new PushSubscription();
    subscription.setUser(user);
    subscription.setDeviceId(deviceId);
    subscription.setFcmToken(fcmToken);
    subscription.setPlatform(platform);
    subscription.setLastSeen(Instant.now());
    return pushSubscriptionRepository.save(subscription);
  }

  public void sendTest(User user, String deviceId, String fcmToken, String platform) {
    subscribe(user, deviceId, fcmToken, platform);
    notificationService.sendTaskReminder(user, null);
  }
}
