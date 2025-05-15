package com.blog.Blog_Backend.controller;

import com.blog.Blog_Backend.entity.BlogPost;
import com.blog.Blog_Backend.entity.User;
import com.blog.Blog_Backend.service.BlogPostService;
import com.blog.Blog_Backend.service.OTPService;
import com.blog.Blog_Backend.service.UserService;
import com.blog.Blog_Backend.utility.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private BlogPostService blogPostService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Create user and send OTP
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, String>> createUser(
            @RequestPart("user") String userJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) {
        try {
            // Deserialize the user JSON string into a User object
            User user = objectMapper.readValue(userJson, User.class);
            if (photo != null) {
                try {
                    user.setPhoto(photo.getBytes());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to process photo", e);
                }
            }
            userService.createUser(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered. Please verify your email with the OTP sent.");
            response.put("email", user.getEmail());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    /**
     * Verify OTP
     */
    @PostMapping("/verify")
    public ResponseEntity<User> verifyOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || otp == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        User verifiedUser = userService.verifyUser(email, otp);
        return ResponseEntity.ok(verifiedUser);
    }

    /**
     * Resend OTP
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        User user = userService.getUserByEmail(email);
        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }
        otpService.sendOTP(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "New OTP sent to your email.");
        return ResponseEntity.ok(response);
    }

    /**
     * Update the current user's profile
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateUser(@RequestBody User updates) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User updated = userService.updateUserByEmail(email, updates);
        return ResponseEntity.ok(updated);
    }

    /**
     * Change the current user's profile picture
     */
    @PatchMapping(value = "/profile/photo", consumes = {"multipart/form-data"})
    public ResponseEntity<User> updatePhoto(@RequestPart("photo") MultipartFile photo) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User updated = userService.updateProfilePicByEmail(email, photo);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get the current user's info and their blogs
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserInfoAndBlogs() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = userService.getUserByEmail(email);
        logger.info("Fetched user: email={}, isVerified={}", email, user.isVerified());
        if (!user.isVerified()) {
            logger.warn("User not verified: email={}", email);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<BlogPost> blogs = blogPostService.getBlogsByAuthorEmail(email);
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("blogs", blogs);
        logger.info("Returning user data: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the current user's LinkedIn profile link
     */
    @GetMapping("/profile/linkedin")
    public ResponseEntity<String> getLinkedInLink() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String link = userService.getLinkedInLinkByEmail(email);
        return ResponseEntity.ok(link);
    }

    /**
     * Get the current user's Twitter profile link
     */
    @GetMapping("/profile/twitter")
    public ResponseEntity<String> getTwitterLink() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String link = userService.getTwitterLinkByEmail(email);
        return ResponseEntity.ok(link);
    }

    /**
     * Get the current user's GitHub profile link
     */
    @GetMapping("/profile/github")
    public ResponseEntity<String> getGitHubLink() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String link = userService.getGitHubLinkByEmail(email);
        return ResponseEntity.ok(link);
    }
}
