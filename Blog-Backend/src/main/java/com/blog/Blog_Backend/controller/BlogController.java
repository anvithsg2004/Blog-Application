package com.blog.Blog_Backend.controller;

import com.blog.Blog_Backend.entity.Blogs;
import com.blog.Blog_Backend.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping
    public ResponseEntity<Blogs> createBlog(@RequestBody Blogs blog) {
        Blogs newBlog = blogService.addBlog(blog);
        return ResponseEntity.ok(newBlog);
    }

    @PutMapping("/{blogId}")
    public ResponseEntity<Blogs> updateBlog(@PathVariable String blogId,
                                            @RequestBody Blogs updatedBlog) {
        Blogs blog = blogService.updateBlog(blogId, updatedBlog);
        return ResponseEntity.ok(blog);
    }

    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deleteBlog(@PathVariable String blogId) {
        blogService.deleteBlog(blogId);
        return ResponseEntity.noContent().build();
    }
}
