package com.taskflow.repository;

import com.taskflow.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByAssignedToId(String userId);
    List<Task> findByDeadlineBeforeAndReminderSentFalse(LocalDate date);
    List<Task> findByProjectIdAndStatus(String projectId, String status);
}
