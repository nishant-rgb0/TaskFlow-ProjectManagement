package com.taskflow.controller;

import com.taskflow.entity.Project;
import com.taskflow.entity.User;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // GET /api/projects — get all projects for current user
    @GetMapping
    public ResponseEntity<List<Project>> getMyProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<Project> owned = projectRepository.findByOwnerId(user.getId());
        List<Project> member = projectRepository.findByMemberIdsContaining(user.getId());
        List<Project> all = new ArrayList<>(owned);
        member.stream().filter(p -> !all.contains(p)).forEach(all::add);
        return ResponseEntity.ok(all);
    }

    // POST /api/projects — create project
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody ProjectRequest request,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .ownerId(user.getId())
                .ownerName(user.getName())
                .build();
        return ResponseEntity.ok(projectRepository.save(project));
    }

    // GET /api/projects/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/projects/{id} — update project
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id,
                                                  @RequestBody ProjectRequest request) {
        return projectRepository.findById(id).map(project -> {
            project.setName(request.getName());
            project.setDescription(request.getDescription());
            return ResponseEntity.ok(projectRepository.save(project));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/projects/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable String id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok("Project deleted");
    }

    // POST /api/projects/{id}/members — add member by email
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable String id, @RequestBody MemberRequest request) {
        User member = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        return projectRepository.findById(id).map(project -> {
            if (!project.getMemberIds().contains(member.getId())) {
                project.getMemberIds().add(member.getId());
                projectRepository.save(project);
            }
            return ResponseEntity.ok("Member added successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET /api/projects/members — get all users (to assign tasks)
    @GetMapping("/all/members")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    static class ProjectRequest {
        private String name, description;
        public String getName() { return name; }
        public String getDescription() { return description; }
        public void setName(String v) { name = v; }
        public void setDescription(String v) { description = v; }
    }

    static class MemberRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String v) { email = v; }
    }
}
