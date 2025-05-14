package com.blog.Blog_Backend.entity;

import org.springframework.data.annotation.CreatedDate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Comment {
    private String id;
    private String content;
    private String authorEmail;
    @CreatedDate
    private Date createdAt;
    private List<Comment> replies;

    // No-args constructor
    public Comment() {
        this.replies = new ArrayList<>();
    }

    // All-args constructor
    public Comment(String id, String content, String authorEmail, Date createdAt, List<Comment> replies) {
        this.id = id;
        this.content = content;
        this.authorEmail = authorEmail;
        this.createdAt = createdAt;
        this.replies = replies != null ? replies : new ArrayList<>();
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public List<Comment> getReplies() {
        return replies;
    }

    public void setReplies(List<Comment> replies) {
        this.replies = replies != null ? replies : new ArrayList<>();
    }
}
