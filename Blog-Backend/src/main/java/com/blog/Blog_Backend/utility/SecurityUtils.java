package com.blog.Blog_Backend.utility;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        // Basic-auth user
        if (principal instanceof UserDetails ud) {
            return ud.getUsername();
        }

        // OAuth2 user
        if (principal instanceof OAuth2User oAuth2User) {
        /* Google => “email”
           GitHub => may need to hit the e-mail API or fall back to “login” */
            Object email = oAuth2User.getAttribute("email");
            if (email == null) {
                email = oAuth2User.getAttribute("login");   // GitHub fallback
            }
            return email != null ? email.toString() : null;
        }
        return null;
    }
}
