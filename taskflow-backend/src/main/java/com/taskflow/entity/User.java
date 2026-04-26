package com.taskflow.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String name;
    private String role; // ADMIN or MEMBER
    private LocalDateTime createdAt;

    public User() { this.createdAt = LocalDateTime.now(); }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User u = new User();
        public Builder email(String v) { u.email = v; return this; }
        public Builder password(String v) { u.password = v; return this; }
        public Builder name(String v) { u.name = v; return this; }
        public Builder role(String v) { u.role = v; return this; }
        public User build() { return u; }
    }
}
