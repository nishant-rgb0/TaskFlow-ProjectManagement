package com.taskflow.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // GET /api/tasks/project/{projectId} — get all tasks for a project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(taskRepository.findByProjectId(projectId));
    }

    // GET /api/tasks/my — get tasks assigned to current user
    @GetMapping("/my")
    public ResponseEntity<List<Task>> getMyTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(taskRepository.findByAssignedToId(user.getId()));
    }

    // POST /api/tasks — create task
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .projectId(request.getProjectId())
                .projectName(request.getProjectName())
                .assignedToId(assignedTo.getId())
                .assignedToName(assignedTo.getName())
                .assignedToEmail(assignedTo.getEmail())
                .status("TODO")
                .priority(request.getPriority())
                .deadline(request.getDeadline())
                .build();
        return ResponseEntity.ok(taskRepository.save(task));
    }

    // PUT /api/tasks/{id}/status — update task status (drag and drop)
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable String id,
                                              @RequestParam String status) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(status);
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/tasks/{id} — update task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id,
                                            @RequestBody TaskRequest request) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setPriority(request.getPriority());
            task.setDeadline(request.getDeadline());
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/tasks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable String id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok("Task deleted");
    }

    // GET /api/tasks/project/{projectId}/export — export tasks as PDF
    @GetMapping("/project/{projectId}/export")
    public void exportPdf(@PathVariable String projectId,
                          HttpServletResponse response) throws IOException, DocumentException {
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=tasks.pdf");

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // Title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("TaskFlow - Task Summary Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        // Table
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2, 2, 2, 2});

        // Headers
        String[] headers = {"Title", "Assigned To", "Status", "Priority", "Deadline"};
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setPadding(6);
            table.addCell(cell);
        }

        // Rows
        Font cellFont = new Font(Font.FontFamily.HELVETICA, 10);
        for (Task task : tasks) {
            table.addCell(new Phrase(task.getTitle(), cellFont));
            table.addCell(new Phrase(task.getAssignedToName() != null ? task.getAssignedToName() : "-", cellFont));
            table.addCell(new Phrase(task.getStatus(), cellFont));
            table.addCell(new Phrase(task.getPriority() != null ? task.getPriority() : "-", cellFont));
            table.addCell(new Phrase(task.getDeadline() != null ? task.getDeadline().toString() : "-", cellFont));
        }

        document.add(table);
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Generated on: " + LocalDate.now().toString(),
                new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC)));
        document.close();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    static class TaskRequest {
        private String title, description, projectId, projectName, assignedToId, priority;
        private LocalDate deadline;
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getProjectId() { return projectId; }
        public String getProjectName() { return projectName; }
        public String getAssignedToId() { return assignedToId; }
        public String getPriority() { return priority; }
        public LocalDate getDeadline() { return deadline; }
        public void setTitle(String v) { title = v; }
        public void setDescription(String v) { description = v; }
        public void setProjectId(String v) { projectId = v; }
        public void setProjectName(String v) { projectName = v; }
        public void setAssignedToId(String v) { assignedToId = v; }
        public void setPriority(String v) { priority = v; }
        public void setDeadline(LocalDate v) { deadline = v; }
    }
}
