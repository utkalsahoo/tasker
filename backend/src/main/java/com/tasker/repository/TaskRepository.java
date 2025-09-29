package com.tasker.repository;

import com.tasker.domain.Task;
import com.tasker.domain.User;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
  Page<Task> findAllByUser(User user, Pageable pageable);

  List<Task> findByUserAndRemindAtBefore(User user, Instant instant);
}
