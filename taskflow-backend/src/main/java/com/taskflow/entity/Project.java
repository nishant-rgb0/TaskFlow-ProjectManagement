package com.taskflow.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;
    private String name;
    private String description;
    private String ownerId;
    private String ownerName;
    private List<String> memberIds = new ArrayList<>();
    private LocalDateTime createdAt;

    public Project() { this.createdAt = LocalDateTime.now(); }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public List<String> getMemberIds() { return memberIds; }
    public void setMemberIds(List<String> memberIds) { this.memberIds = memberIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Project p = new Project();
        public Builder name(String v) { p.name = v; return this; }
        public Builder description(String v) { p.description = v; return this; }
        public Builder ownerId(String v) { p.ownerId = v; return this; }
        public Builder ownerName(String v) { p.ownerName = v; return this; }
        public Project build() { return p; }
    }
}
