package com.blog.Blog_Backend.service;

import com.blog.Blog_Backend.entity.User;
import com.blog.Blog_Backend.repository.UserRepository;
import com.blog.Blog_Backend.utility.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new user. Photo is optional/nullable.
     */
    public User createUser(User user) {
        // Hash the password before saving
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    /**
     * Update user (identified by email; email itself cannot be changed)
     */
    public User updateUserByEmail(String email, User updates) {
        // Check if the current user is authorized to update this profile
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this user");
        }

        User existing = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        existing.setName(updates.getName());
        // Hash the password if updated
        if (updates.getPassword() != null) {
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        existing.setPhone(updates.getPhone());
        existing.setLinkedin(updates.getLinkedin());
        existing.setGithub(updates.getGithub());
        existing.setAbout(updates.getAbout());
        // do NOT touch existing.setEmail(...)
        return userRepository.save(existing);
    }

    /**
     * Change only the profile picture (identified by email)
     */
    public User updateProfilePicByEmail(String email, MultipartFile file) {
        // Check if the current user is authorized to update this profile
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null || !currentUserEmail.equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this user");
        }

        User existing = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        try {
            existing.setPhoto(file.getBytes());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read file");
        }
        return userRepository.save(existing);
    }

    /**
     * Get a user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    /**
     * Get a user's LinkedIn profile link by email
     */
    public String getLinkedInLinkByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getLinkedin();
    }

    /**
     * Get a user's Twitter profile link by email
     */
    public String getTwitterLinkByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getTwitter();
    }

    /**
     * Get a user's GitHub profile link by email
     */
    public String getGitHubLinkByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getGithub();
    }
}
