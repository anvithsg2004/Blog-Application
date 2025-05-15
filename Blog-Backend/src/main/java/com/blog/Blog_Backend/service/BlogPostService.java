package com.blog.Blog_Backend.service;

import com.blog.Blog_Backend.entity.BlogPost;
import com.blog.Blog_Backend.entity.Comment;
import com.blog.Blog_Backend.entity.User;
import com.blog.Blog_Backend.repository.BlogPostRepository;
import com.blog.Blog_Backend.utility.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BlogPostService {

    @Autowired
    private BlogPostRepository repo;

    @Autowired
    private UserService userService;

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
     * Only title, content, codeLanguage, codeSnippet, and image are replaced.
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
        if (updates.getImage() != null) {
            existing.setImage(updates.getImage());
        }
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
        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found")
                );
        // Transform comments to replace authorEmail with authorName
        blog.setComments(transformComments(blog.getComments()));
        return blog;
    }

    /**
     * Transform comments to replace authorEmail with authorName
     */
    private List<Comment> transformComments(List<Comment> comments) {
        List<Comment> transformed = new ArrayList<>();
        for (Comment comment : comments) {
            Comment transformedComment = new Comment();
            transformedComment.setId(comment.getId());
            transformedComment.setContent(comment.getContent());
            // Fetch author name
            User author = userService.getUserByEmail(comment.getAuthorEmail());
            transformedComment.setAuthorEmail(author.getName()); // Use name instead of email
            transformedComment.setCreatedAt(comment.getCreatedAt());
            // Recursively transform replies
            transformedComment.setReplies(transformComments(comment.getReplies()));
            transformed.add(transformedComment); // Changed from push to add
        }
        return transformed;
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

    /**
     * Delete a comment by blog ID and comment ID
     */
    public BlogPost deleteComment(String blogId, String commentId, String authorEmail) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment");
        }

        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));

        Comment comment = findCommentById(blog.getComments(), commentId);
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        if (!comment.getAuthorEmail().equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment");
        }

        blog.getComments().removeIf(c -> c.getId().equals(commentId));
        return repo.save(blog);
    }

    /**
     * Delete a reply by blog ID, comment ID, and reply ID
     */
    public BlogPost deleteReply(String blogId, String commentId, String replyId, String authorEmail) {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this reply");
        }

        BlogPost blog = repo.findById(blogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));

        Comment parentComment = findCommentById(blog.getComments(), commentId);
        if (parentComment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found");
        }

        Comment reply = parentComment.getReplies().stream()
                .filter(r -> r.getId().equals(replyId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reply not found"));

        if (!reply.getAuthorEmail().equals(authorEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this reply");
        }

        parentComment.getReplies().removeIf(r -> r.getId().equals(replyId));
        return repo.save(blog);
    }
}
