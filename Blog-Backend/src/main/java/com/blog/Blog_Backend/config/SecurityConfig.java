package com.blog.Blog_Backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Public endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // Allow registration
                        .requestMatchers(HttpMethod.GET, "/api/blogs").permitAll() // Allow seeing list of blogs
                        .requestMatchers(HttpMethod.POST, "/api/users/verify").permitAll() // Allow OTP verification
                        .requestMatchers(HttpMethod.POST, "/api/users/resend-otp").permitAll() // Allow OTP resend
                        // Authenticated endpoints
                        .requestMatchers(HttpMethod.GET, "/api/blogs/{blogId}").authenticated() // Blog details
                        .requestMatchers(HttpMethod.POST, "/api/blogs").authenticated() // Create blog
                        .requestMatchers(HttpMethod.PUT, "/api/blogs").authenticated() // Update blog
                        .requestMatchers(HttpMethod.DELETE, "/api/blogs/{blogId}").authenticated() // Delete blog
                        .requestMatchers(HttpMethod.POST, "/api/blogs/{blogId}/comments").authenticated() // Add comment
                        .requestMatchers(HttpMethod.POST, "/api/blogs/{blogId}/comments/{parentCommentId}/replies").authenticated() // Add reply
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated() // User info and profile links
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated() // Update user profile
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").authenticated() // Update profile picture
                        .anyRequest().permitAll()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .userDetailsService(userDetailsService)
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://aidenblog.netlify.app"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
