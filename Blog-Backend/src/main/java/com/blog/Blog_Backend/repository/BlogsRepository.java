package com.blog.Blog_Backend.repository;

import com.blog.Blog_Backend.entity.Blogs;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface BlogsRepository extends MongoRepository<Blogs, String> {

    // Option 1: Get the entire Blogs object (extract ID manually)
    Blogs findByEmail(String email);

    // Option 2: Get only the ID directly using a custom query
    @Query(value = "{'email': ?0}", fields = "{'_id': 1}")
    String findIdByEmail(String email);

}
