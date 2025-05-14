package com.blog.Blog_Backend.service;

import com.blog.Blog_Backend.entity.BlogPost;
import com.blog.Blog_Backend.entity.Comment;
import com.blog.Blog_Backend.repository.BlogPostRepository;
import com.blog.Blog_Backend.utility.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BlogPostService {

    @Autowired
    private BlogPostRepository repo;

    /**
     * Create a new blog for the given user email.
     */
    public BlogPost createBlog(String email, BlogPost blog) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to create a blog for this user");
        }
        blog.setAuthorEmail(email);
        return repo.save(blog);
    }

    /**
     * Update an existing blog by user email.
     * Only title, content, codeLanguage, and codeSnippet are replaced.
     */
    public BlogPost updateBlog(String email, BlogPost updates) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this blog");
        }

        BlogPost existing = repo.findById(updates.getId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found")
                );
        if (!existing.getAuthorEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this blog");
        }
        existing.setTitle(updates.getTitle());
        existing.setContent(updates.getContent());
        existing.setCodeLanguage(updates.getCodeLanguage());
        existing.setCodeSnippet(updates.getCodeSnippet());
        // Preserve existing comments
        if (updates.getComments() != null) {
            existing.setComments(updates.getComments());
        }
        return repo.save(existing);
    }

    /**
     * Get all blogs.
     */
    public List<BlogPost> getAllBlogs() {
        return repo.findAll();
    }

    /**
     * Get a blog by its ID.
     */
    public BlogPost getBlogById(String blogId) {
        return repo.findById(blogId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found")
                );
    }

    /**
     * Get blogs by author email.
     */
    public List<BlogPost> getBlogsByAuthorEmail(String email) {
        return repo.findByAuthorEmail(email);
    }

    /**
     * Delete a blog by its ID.
     */
    public void deleteBlog(String blogId) {
        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(blog.getAuthorEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this blog");
        }
        repo.deleteById(blogId);
    }

    /**
     * Add a comment to a blog post by blog ID.
     */
    public BlogPost addComment(String blogId, String authorEmail, String content) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to comment as this user");
        }

        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found")
                );
        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(content);
        comment.setAuthorEmail(authorEmail);
        // createdAt will be set automatically by @CreatedDate
        blog.getComments().add(comment);
        return repo.save(blog);
    }

    /**
     * Add a reply to a comment or nested reply by comment ID.
     */
    public BlogPost addReply(String blogId, String parentCommentId, String authorEmail, String content) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to reply as this user");
        }

        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found")
                );

        // Traverse the comment tree to find the parent comment
        Comment parentComment = findCommentById(blog.getComments(), parentCommentId);
        if (parentComment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found");
        }

        // Create the new reply
        Comment reply = new Comment();
        reply.setId(UUID.randomUUID().toString());
        reply.setContent(content);
        reply.setAuthorEmail(authorEmail);
        // createdAt will be set automatically by @CreatedDate

        // Add the reply to the parent's replies list
        parentComment.getReplies().add(reply);

        return repo.save(blog);
    }

    /**
     * Helper method to find a comment by ID in a nested comment tree.
     */
    private Comment findCommentById(List<Comment> comments, String commentId) {
        for (Comment comment : comments) {
            if (comment.getId().equals(commentId)) {
                return comment;
            }
            // Recursively search in replies
            Comment found = findCommentById(comment.getReplies(), commentId);
            if (found != null) {
                return found;
            }
        }
        return null;
    }
}
