package com.blog.Blog_Backend.controller;

import com.blog.Blog_Backend.entity.BlogPost;
import com.blog.Blog_Backend.entity.User;
import com.blog.Blog_Backend.repository.BlogPostRepository;
import com.blog.Blog_Backend.service.BlogPostService;
import com.blog.Blog_Backend.service.EmailService;
import com.blog.Blog_Backend.service.UserService;
import com.blog.Blog_Backend.utility.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/blogs")
public class BlogPostController {

    @Autowired
    private BlogPostService service;

    @Autowired
    private UserService userService;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Create a new blog for the current user
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<BlogPost> createBlog(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "language", required = false) String language,
            @RequestPart(value = "code", required = false) String code,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        BlogPost blog = new BlogPost();
        blog.setTitle(title);
        blog.setContent(content);
        blog.setCodeLanguage(language);
        blog.setCodeSnippet(code);
        if (image != null && !image.isEmpty()) {
            try {
                blog.setImage(image.getBytes());
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        BlogPost saved = service.createBlog(email, blog);
        emailService.sendNewBlogNotification(blog.getTitle(), blog.getId(), email);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Update a blog for the current user
     */
    @PutMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<BlogPost> updateBlog(
            @RequestPart("id") String id,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "language", required = false) String language,
            @RequestPart(value = "code", required = false) String code,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        if (id == null || id.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        BlogPost updates = new BlogPost();
        updates.setId(id);
        updates.setTitle(title);
        updates.setContent(content);
        updates.setCodeLanguage(language);
        updates.setCodeSnippet(code);
        if (image != null && !image.isEmpty()) {
            try {
                updates.setImage(image.getBytes());
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        BlogPost updated = service.updateBlog(email, updates);
        emailService.sendUpdatedBlogNotification(updated.getTitle(), updated.getId(), email);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get all blogs
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBlogs() {
        List<BlogPost> blogs = service.getAllBlogs();
        List<Map<String, Object>> response = new ArrayList<>();

        for (BlogPost blog : blogs) {
            User author = userService.getUserByEmail(blog.getAuthorEmail());
            Map<String, Object> blogData = new HashMap<>();
            blogData.put("id", blog.getId());
            blogData.put("title", blog.getTitle());
            blogData.put("content", blog.getContent());
            blogData.put("codeLanguage", blog.getCodeLanguage());
            blogData.put("codeSnippet", blog.getCodeSnippet());
            blogData.put("image", blog.getImage() != null ? Base64.getEncoder().encodeToString(blog.getImage()) : null);
            blogData.put("createdAt", blog.getCreatedAt());
            blogData.put("updatedAt", blog.getUpdatedAt());
            blogData.put("authorEmail", blog.getAuthorEmail()); // Include authorEmail
            response.add(blogData);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get a blog by its ID
     */
    @GetMapping("/{blogId}")
    public ResponseEntity<Map<String, Object>> getBlogById(@PathVariable String blogId) {
        BlogPost blog = service.getBlogById(blogId);
        User author = userService.getUserByEmail(blog.getAuthorEmail());

        // Construct response with only allowed author fields
        Map<String, Object> authorInfo = new HashMap<>();
        authorInfo.put("name", author.getName());
        authorInfo.put("photo", author.getPhoto());
        authorInfo.put("about", author.getAbout());
        authorInfo.put("linkedin", author.getLinkedin());
        authorInfo.put("github", author.getGithub());
        authorInfo.put("twitter", author.getTwitter());

        Map<String, Object> response = new HashMap<>();
        response.put("id", blog.getId());
        response.put("title", blog.getTitle());
        response.put("content", blog.getContent());
        response.put("codeLanguage", blog.getCodeLanguage());
        response.put("codeSnippet", blog.getCodeSnippet());
        response.put("image", blog.getImage() != null ? Base64.getEncoder().encodeToString(blog.getImage()) : null);
        response.put("comments", blog.getComments());
        response.put("createdAt", blog.getCreatedAt());
        response.put("updatedAt", blog.getUpdatedAt());
        response.put("authorEmail", blog.getAuthorEmail()); // Include authorEmail
        response.put("author", authorInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * Delete a blog by its ID
     */
    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deleteBlog(@PathVariable String blogId) {
        service.deleteBlog(blogId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Add a comment to a blog post by blog ID
     */
    @PostMapping("/{blogId}/comments")
    public ResponseEntity<BlogPost> addComment(
            @PathVariable String blogId,
            @RequestBody Map<String, String> commentData
    ) {
        String authorEmail = SecurityUtils.getCurrentUserEmail();
        if (authorEmail == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String content = commentData.get("content");
        if (content == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        BlogPost updatedBlog = service.addComment(blogId, authorEmail, content);
        return ResponseEntity.ok(updatedBlog);
    }

    /**
     * Add a reply to a comment or nested reply by comment ID
     */
    @PostMapping("/{blogId}/comments/{parentCommentId}/replies")
    public ResponseEntity<BlogPost> addReply(
            @PathVariable String blogId,
            @PathVariable String parentCommentId,
            @RequestBody Map<String, String> replyData
    ) {
        String authorEmail = SecurityUtils.getCurrentUserEmail();
        if (authorEmail == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String content = replyData.get("content");
        if (content == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        BlogPost updatedBlog = service.addReply(blogId, parentCommentId, authorEmail, content);
        return ResponseEntity.ok(updatedBlog);
    }

    /**
     * Delete a comment by blog ID and comment ID
     */
    @DeleteMapping("/{blogId}/comments/{commentId}")
    public ResponseEntity<BlogPost> deleteComment(
            @PathVariable String blogId,
            @PathVariable String commentId
    ) {
        String authorEmail = SecurityUtils.getCurrentUserEmail();
        if (authorEmail == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        BlogPost updatedBlog = service.deleteComment(blogId, commentId, authorEmail);
        return ResponseEntity.ok(updatedBlog);
    }

    /**
     * Delete a reply by blog ID, comment ID, and reply ID
     */
    @DeleteMapping("/{blogId}/comments/{commentId}/replies/{replyId}")
    public ResponseEntity<BlogPost> deleteReply(
            @PathVariable String blogId,
            @PathVariable String commentId,
            @PathVariable String replyId
    ) {
        String authorEmail = SecurityUtils.getCurrentUserEmail();
        if (authorEmail == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        BlogPost updatedBlog = service.deleteReply(blogId, commentId, replyId, authorEmail);
        return ResponseEntity.ok(updatedBlog);
    }
}
