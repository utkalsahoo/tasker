package com.tasker.repository;

import com.tasker.domain.PushSubscription;
import com.tasker.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
  List<PushSubscription> findByUser(User user);
}
