package com.tasker.config;

import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

@Configuration
public class QuartzConfig {
  @Bean
  public SchedulerFactoryBean schedulerFactoryBean(AutowireCapableBeanFactory beanFactory) {
    SchedulerFactoryBean factoryBean = new SchedulerFactoryBean();
    factoryBean.setJobFactory(new AutowiringSpringBeanJobFactory(beanFactory));
    return factoryBean;
  }

  @Bean
  public Scheduler scheduler(SchedulerFactoryBean factoryBean) throws SchedulerException {
    Scheduler scheduler = factoryBean.getScheduler();
    scheduler.start();
    return scheduler;
  }
}
