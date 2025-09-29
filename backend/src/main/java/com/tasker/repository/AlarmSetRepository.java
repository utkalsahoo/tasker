package com.tasker.repository;

import com.tasker.domain.AlarmSet;
import com.tasker.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlarmSetRepository extends JpaRepository<AlarmSet, Long> {
  List<AlarmSet> findByUser(User user);
}
