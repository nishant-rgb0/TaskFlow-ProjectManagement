package com.taskflow.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "tasks")
public class Task {

    @Id
    private String id;
    private String title;
    private String description;
    private String projectId;
    private String projectName;
    private String assignedToId;
    private String assignedToName;
    private String assignedToEmail;
    private String status; // TODO, IN_PROGRESS, DONE
    private String priority; // LOW, MEDIUM, HIGH
    private LocalDate deadline;
    private boolean reminderSent = false;
    private LocalDateTime createdAt;

    public Task() { this.createdAt = LocalDateTime.now(); }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getAssignedToId() { return assignedToId; }
    public void setAssignedToId(String assignedToId) { this.assignedToId = assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public String getAssignedToEmail() { return assignedToEmail; }
    public void setAssignedToEmail(String assignedToEmail) { this.assignedToEmail = assignedToEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public boolean isReminderSent() { return reminderSent; }
    public void setReminderSent(boolean reminderSent) { this.reminderSent = reminderSent; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Task t = new Task();
        public Builder title(String v) { t.title = v; return this; }
        public Builder description(String v) { t.description = v; return this; }
        public Builder projectId(String v) { t.projectId = v; return this; }
        public Builder projectName(String v) { t.projectName = v; return this; }
        public Builder assignedToId(String v) { t.assignedToId = v; return this; }
        public Builder assignedToName(String v) { t.assignedToName = v; return this; }
        public Builder assignedToEmail(String v) { t.assignedToEmail = v; return this; }
        public Builder status(String v) { t.status = v; return this; }
        public Builder priority(String v) { t.priority = v; return this; }
        public Builder deadline(LocalDate v) { t.deadline = v; return this; }
        public Task build() { return t; }
    }
}
