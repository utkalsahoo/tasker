package com.tasker.service;

import com.tasker.domain.User;
import com.tasker.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User requireUser(Long id) {
    return userRepository.findById(id).orElseThrow(EntityNotFoundException::new);
  }
}
