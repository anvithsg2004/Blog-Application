package com.blog.Blog_Backend.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "blogposts")
public class BlogPost {
    @Id
    private String id;
    private String title;
    private String authorEmail;
    private String content;       // your blogContent
    private String codeLanguage;  // language of the code snippet
    private String codeSnippet;   // your codeContent
    private byte[] image;         // featured image bytes
    private List<Comment> comments = new ArrayList<>(); // List of comments
    @CreatedDate
    private Date createdAt;
    @LastModifiedDate
    private Date updatedAt;

    // No-args constructor
    public BlogPost() {
    }

    // All-args constructor
    public BlogPost(
            String id,
            String title,
            String authorEmail,
            String content,
            String codeLanguage,
            String codeSnippet,
            byte[] image,
            List<Comment> comments,
            Date createdAt,
            Date updatedAt
    ) {
        this.id = id;
        this.title = title;
        this.authorEmail = authorEmail;
        this.content = content;
        this.codeLanguage = codeLanguage;
        this.codeSnippet = codeSnippet;
        this.image = image;
        this.comments = comments != null ? comments : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCodeLanguage() {
        return codeLanguage;
    }

    public void setCodeLanguage(String codeLanguage) {
        this.codeLanguage = codeLanguage;
    }

    public String getCodeSnippet() {
        return codeSnippet;
    }

    public void setCodeSnippet(String codeSnippet) {
        this.codeSnippet = codeSnippet;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
