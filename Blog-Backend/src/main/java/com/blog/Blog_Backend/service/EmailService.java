package com.blog.Blog_Backend.service;

import com.blog.Blog_Backend.entity.GeneralSubscriber;
import com.blog.Blog_Backend.entity.Notification;
import com.blog.Blog_Backend.entity.Subscriber;
import com.blog.Blog_Backend.repository.GeneralSubscriberRepository;
import com.blog.Blog_Backend.repository.NotificationRepository;
import com.blog.Blog_Backend.repository.SubscriberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SubscriberRepository subscriberRepository;

    @Autowired
    private GeneralSubscriberRepository generalSubscriberRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNewBlogNotification(String blogTitle, String blogId, String authorEmail) {
        // Notify author-specific subscribers
        List<Subscriber> authorSubscribers = subscriberRepository.findBySubscribedAuthorsContaining(authorEmail);
        for (Subscriber subscriber : authorSubscribers) {
            // Create notification
            Notification notification = new Notification();
            notification.setUserEmail(subscriber.getEmail());
            notification.setBlogId(blogId);
            notification.setAuthorEmail(authorEmail);
            notification.setBlogTitle(blogTitle);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send email
            sendEmail(
                    subscriber.getEmail(),
                    "New Blog Posted by Your Subscribed Author",
                    createNewBlogEmailContent(blogTitle, blogId, subscriber.getEmail(), authorEmail, true)
            );
        }

        // Notify general subscribers
        List<GeneralSubscriber> generalSubscribers = generalSubscriberRepository.findAll();
        for (GeneralSubscriber subscriber : generalSubscribers) {
            // Create notification
            Notification notification = new Notification();
            notification.setUserEmail(subscriber.getEmail());
            notification.setBlogId(blogId);
            notification.setAuthorEmail(authorEmail);
            notification.setBlogTitle(blogTitle);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send email
            sendEmail(
                    subscriber.getEmail(),
                    "New Blog Posted on AIDEN",
                    createNewBlogEmailContent(blogTitle, blogId, subscriber.getEmail(), null, false)
            );
        }
    }

    public void sendUpdatedBlogNotification(String blogTitle, String blogId, String authorEmail) {
        // Notify author-specific subscribers
        List<Subscriber> authorSubscribers = subscriberRepository.findBySubscribedAuthorsContaining(authorEmail);
        for (Subscriber subscriber : authorSubscribers) {
            // Create notification
            Notification notification = new Notification();
            notification.setUserEmail(subscriber.getEmail());
            notification.setBlogId(blogId);
            notification.setAuthorEmail(authorEmail);
            notification.setBlogTitle(blogTitle);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send email
            sendEmail(
                    subscriber.getEmail(),
                    "Blog Updated by Your Subscribed Author",
                    createUpdatedBlogEmailContent(blogTitle, blogId, subscriber.getEmail(), authorEmail, true)
            );
        }

        // Notify general subscribers
        List<GeneralSubscriber> generalSubscribers = generalSubscriberRepository.findAll();
        for (GeneralSubscriber subscriber : generalSubscribers) {
            // Create notification
            Notification notification = new Notification();
            notification.setUserEmail(subscriber.getEmail());
            notification.setBlogId(blogId);
            notification.setAuthorEmail(authorEmail);
            notification.setBlogTitle(blogTitle);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send email
            sendEmail(
                    subscriber.getEmail(),
                    "Blog Updated on AIDEN",
                    createUpdatedBlogEmailContent(blogTitle, blogId, subscriber.getEmail(), null, false)
            );
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    private String createNewBlogEmailContent(String blogTitle, String blogId, String email, String authorEmail, boolean isAuthorSpecific) {
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String unsubscribeUrl = isAuthorSpecific
                ? "http://localhost:5173/unsubscribe/author?email=" + encodedEmail + "&authorEmail=" + URLEncoder.encode(authorEmail, StandardCharsets.UTF_8)
                : "http://localhost:5173/unsubscribe/general?email=" + encodedEmail;
        String message = isAuthorSpecific
                ? "A new blog titled <strong>" + blogTitle + "</strong> has been posted by your subscribed author."
                : "A new blog titled <strong>" + blogTitle + "</strong> has been posted on AIDEN.";
        String unsubscribeText = isAuthorSpecific
                ? "Unsubscribe from this author"
                : "Unsubscribe from AIDEN updates";

        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<h2>New Blog Posted on AIDEN!</h2>" +
                "<p>" + message + "</p>" +
                "<p>Read it now: <a href='http://localhost:5173/blog/" + blogId + "' style='color: #4B6CB7; text-decoration: none;'>View Blog</a></p>" +
                "<p>Stay tuned for more updates!</p>" +
                "<p><small><a href='" + unsubscribeUrl + "' style='color: #999;'>" + unsubscribeText + "</a></small></p>" +
                "</body>" +
                "</html>";
    }

    private String createUpdatedBlogEmailContent(String blogTitle, String blogId, String email, String authorEmail, boolean isAuthorSpecific) {
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String unsubscribeUrl = isAuthorSpecific
                ? "http://localhost:5173/unsubscribe/author?email=" + encodedEmail + "&authorEmail=" + URLEncoder.encode(authorEmail, StandardCharsets.UTF_8)
                : "http://localhost:5173/unsubscribe/general?email=" + encodedEmail;
        String message = isAuthorSpecific
                ? "The blog titled <strong>" + blogTitle + "</strong> has been updated by your subscribed author."
                : "The blog titled <strong>" + blogTitle + "</strong> has been updated on AIDEN.";
        String unsubscribeText = isAuthorSpecific
                ? "Unsubscribe from this author"
                : "Unsubscribe from AIDEN updates";

        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<h2>Blog Updated on AIDEN!</h2>" +
                "<p>" + message + "</p>" +
                "<p>Check out the updates: <a href='http://localhost:5173/blog/" + blogId + "' style='color: #4B6CB7; text-decoration: none;'>View Blog</a></p>" +
                "<p>Stay tuned for more updates!</p>" +
                "<p><small><a href='" + unsubscribeUrl + "' style='color: #999;'>" + unsubscribeText + "</a></small></p>" +
                "</body>" +
                "</html>";
    }
}
