package com.blog.Blog_Backend.controller;

import com.blog.Blog_Backend.entity.BlogPost;
import com.blog.Blog_Backend.service.BlogPostService;
import com.blog.Blog_Backend.utility.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogPostController {

    @Autowired
    private BlogPostService service;

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
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Update a blog for the current user
     */
    @PutMapping
    public ResponseEntity<Object> updateBlog(@RequestBody BlogPost updates) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        if (updates.getId() == null || updates.getId().trim().isEmpty()) {
            return new ResponseEntity<>("Blog ID is required to update a blog", HttpStatus.BAD_REQUEST);
        }
        BlogPost updated = service.updateBlog(email, updates);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get all blogs
     */
    @GetMapping
    public ResponseEntity<List<BlogPost>> getAllBlogs() {
        List<BlogPost> blogs = service.getAllBlogs();
        return ResponseEntity.ok(blogs);
    }

    /**
     * Get a blog by its ID
     */
    @GetMapping("/{blogId}")
    public ResponseEntity<BlogPost> getBlogById(@PathVariable String blogId) {
        BlogPost blog = service.getBlogById(blogId);
        return ResponseEntity.ok(blog);
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
}
