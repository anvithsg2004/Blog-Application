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

//    private final CustomOAuth2UserService oAuth2UserService;
//
//    public SecurityConfig(CustomOAuth2UserService oAuth2UserService) {
//        this.oAuth2UserService = oAuth2UserService;
//    }

    private final UnifiedOAuth2UserService unifiedOAuth2UserService;

    public SecurityConfig(UnifiedOAuth2UserService unifiedOAuth2UserService) {
        this.unifiedOAuth2UserService = unifiedOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // OAuth2 end-points themselves are public
                        .requestMatchers("/login/**", "/oauth2/**").permitAll()
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
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .userDetailsService(userDetailsService)
                .httpBasic(Customizer.withDefaults())
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(ue -> ue
                                .userService(unifiedOAuth2UserService::loadUser)        // For OAuth2
                                .oidcUserService(unifiedOAuth2UserService::loadUser)     // For OIDC
                        )
                        .defaultSuccessUrl("http://localhost:5173/login?success=oauth", true)
                        .failureUrl("http://localhost:5173/login?error=oauth_failed")
                );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://aidenblog.netlify.app", "https://blogs-backend-fj3b.onrender.com", "https://newblogbackend.onrender.com"));
//        config.setAllowedOrigins(Arrays.asList("*"));
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
