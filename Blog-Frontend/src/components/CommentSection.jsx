import React, { useState, useEffect, useContext } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { v4 as uuidv4 } from 'uuid';
import apiFetch from '../components/utils/api';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const CommentSection = ({ blogId }) => {
    const [comments, setComments] = useState([]);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch comments when component mounts
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await apiFetch(`/api/blogs/${blogId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${localStorage.getItem('authCredentials')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data.comments || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [blogId]);

    const handleAddComment = async (content) => {
        if (!isLoggedIn) {
            localStorage.setItem('redirectAfterLogin', `/blogs/${blogId}`);
            navigate('/login');
            return;
        }

        try {
            const response = await apiFetch(`/api/blogs/${blogId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${localStorage.getItem('authCredentials')}`,
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            const updatedBlog = await response.json();
            setComments(updatedBlog.comments || []);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleAddReply = async (commentId, content) => {
        if (!isLoggedIn) {
            localStorage.setItem('redirectAfterLogin', `/blogs/${blogId}`);
            navigate('/login');
            return;
        }

        try {
            const response = await apiFetch(`/api/blogs/${blogId}/comments/${commentId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${localStorage.getItem('authCredentials')}`,
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                throw new Error('Failed to add reply');
            }
            const updatedBlog = await response.json();
            setComments(updatedBlog.comments || []);
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await apiFetch(`/api/blogs/${blogId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${localStorage.getItem('authCredentials')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }
            const updatedBlog = await response.json();
            setComments(updatedBlog.comments || []);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        try {
            const response = await apiFetch(`/api/blogs/${blogId}/comments/${commentId}/replies/${replyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${localStorage.getItem('authCredentials')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete reply');
            }
            const updatedBlog = await response.json();
            setComments(updatedBlog.comments || []);
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    };

    return (
        <div className="mt-16 pt-8 border-t border-[rgba(229,228,226,0.3)]">
            <h2 className="text-2xl font-['Space_Grotesk'] font-bold text-white mb-8">
                Comments ({comments.length})
            </h2>

            <CommentForm onSubmit={handleAddComment} />

            <div className="mt-12">
                {comments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onAddReply={handleAddReply}
                        onDeleteComment={handleDeleteComment}
                        onDeleteReply={handleDeleteReply}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
