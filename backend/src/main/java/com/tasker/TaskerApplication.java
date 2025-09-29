package com.tasker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TaskerApplication {
  public static void main(String[] args) {
    SpringApplication.run(TaskerApplication.class, args);
  }
}
