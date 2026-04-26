package com.taskflow.service;

import com.taskflow.entity.Task;
import com.taskflow.repository.TaskRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmailReminderService {

    private final TaskRepository taskRepository;
    private final JavaMailSender mailSender;

    public EmailReminderService(TaskRepository taskRepository, JavaMailSender mailSender) {
        this.taskRepository = taskRepository;
        this.mailSender = mailSender;
    }

    // Runs every day at 8 AM — checks for tasks due in next 2 days
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDeadlineReminders() {
        LocalDate twoDaysFromNow = LocalDate.now().plusDays(2);
        List<Task> upcomingTasks = taskRepository
                .findByDeadlineBeforeAndReminderSentFalse(twoDaysFromNow);

        for (Task task : upcomingTasks) {
            if (task.getAssignedToEmail() != null && !task.getStatus().equals("DONE")) {
                sendReminderEmail(task);
                task.setReminderSent(true);
                taskRepository.save(task);
            }
        }
    }

    private void sendReminderEmail(Task task) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(task.getAssignedToEmail());
            message.setSubject("TaskFlow Reminder: Task deadline approaching — " + task.getTitle());
            message.setText(
                "Hi " + task.getAssignedToName() + ",\n\n" +
                "This is a reminder that your task is due soon!\n\n" +
                "Task: " + task.getTitle() + "\n" +
                "Project: " + task.getProjectName() + "\n" +
                "Deadline: " + task.getDeadline() + "\n" +
                "Status: " + task.getStatus() + "\n\n" +
                "Please make sure to complete it on time.\n\n" +
                "TaskFlow Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send reminder email: " + e.getMessage());
        }
    }
}
