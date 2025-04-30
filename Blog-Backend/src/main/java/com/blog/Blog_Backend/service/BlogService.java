package com.blog.Blog_Backend.service;

import com.blog.Blog_Backend.entity.Blogs;
import com.blog.Blog_Backend.repository.BlogsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BlogService {

    @Autowired
    private BlogsRepository blogRepository;

    public Blogs addBlog(Blogs blog) {
        blog.setBlogId(null); // Ensure MongoDB generates ID
        LocalDateTime now = LocalDateTime.now();
        blog.setWrittenDate(now);
        blog.setLastUpdatedDate(now);
        return blogRepository.save(blog);
    }

    public Blogs updateBlog(String blogId, Blogs updatedBlog) {
        Blogs existingBlog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Update only allowed fields
        existingBlog.setTitle(updatedBlog.getTitle());
        existingBlog.setContent(updatedBlog.getContent());
        existingBlog.setCode(updatedBlog.getCode());
        existingBlog.setLastUpdatedDate(LocalDateTime.now());

        return blogRepository.save(existingBlog);
    }

    public void deleteBlog(String blogId) {
        blogRepository.deleteById(blogId);
    }
}
