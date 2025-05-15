package com.blog.Blog_Backend.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Base64;
import java.util.Date;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String phone;
    private byte[] photo;
    private String linkedin;
    private String github;
    private String twitter;
    private String about;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    // No-args constructor
    public User() {
    }

    // All-args constructor
    public User(String id,
                String name,
                String email,
                String password,
                String phone,
                byte[] photo,
                String linkedin,
                String github,
                String twitter,
                String about,
                Date createdAt,
                Date updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.photo = photo;
        this.linkedin = linkedin;
        this.github = github;
        this.twitter = twitter;
        this.about = about;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // Return Base64-encoded photo string
    public String getPhoto() {
        return photo != null ? Base64.getEncoder().encodeToString(photo) : null;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getTwitter() {
        return twitter;
    }

    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
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
