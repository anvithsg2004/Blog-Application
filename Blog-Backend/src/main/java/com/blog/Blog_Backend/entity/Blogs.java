package com.blog.Blog_Backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "Blogs")
public class Blogs {

    @Id
    private String blogId;
    private String userEmail;
    private String title;
    private List<String> content;
    private List<String> code;
    private LocalDateTime writtenDate;
    private LocalDateTime lastUpdatedDate;

    // No-arg constructor
    public Blogs() {
    }

    // All-args constructor
    public Blogs(String blogId, String userEmail, String title, List<String> content, List<String> code, LocalDateTime writtenDate, LocalDateTime lastUpdatedDate) {
        this.blogId = blogId;
        this.userEmail = userEmail;
        this.title = title;
        this.content = content;
        this.code = code;
        this.writtenDate = writtenDate;
        this.lastUpdatedDate = lastUpdatedDate;
    }

    // Getters and Setters

    public String getBlogId() {
        return blogId;
    }

    public void setBlogId(String blogId) {
        this.blogId = blogId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getContent() {
        return content;
    }

    public void setContent(List<String> content) {
        this.content = content;
    }

    public List<String> getCode() {
        return code;
    }

    public void setCode(List<String> code) {
        this.code = code;
    }

    public LocalDateTime getWrittenDate() {
        return writtenDate;
    }

    public void setWrittenDate(LocalDateTime writtenDate) {
        this.writtenDate = writtenDate;
    }

    public LocalDateTime getLastUpdatedDate() {
        return lastUpdatedDate;
    }

    public void setLastUpdatedDate(LocalDateTime lastUpdatedDate) {
        this.lastUpdatedDate = lastUpdatedDate;
    }
}
