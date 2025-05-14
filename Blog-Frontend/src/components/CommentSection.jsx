import React, { useState } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { v4 as uuidv4 } from 'uuid';

const CommentSection = ({ blogId }) => {
    const [comments, setComments] = useState([
        {
            id: '1',
            content: 'This article brilliantly explores the tension between brutalist design principles and modern UI expectations.',
            author: 'Jane Cooper',
            date: 'May 1, 2025',
            replies: [
                {
                    id: '1-reply-1',
                    content: 'I agree! The concept of "digital honesty" described here reminds me of architectural brutalism\'s ethical dimensions.',
                    author: 'Robert Chen',
                    date: 'May 2, 2025',
                }
            ]
        },
        {
            id: '2',
            content: 'I\'ve been implementing some of these brutalist principles in my recent projects. The user feedback has been surprisingly positive!',
            author: 'Marcus Johnson',
            date: 'Apr 27, 2025',
            replies: []
        }
    ]);

    const handleAddComment = (content) => {
        const newComment = {
            id: uuidv4(),
            content,
            author: 'Guest User', // In a real app, get the user's name from auth
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            replies: []
        };

        setComments([...comments, newComment]);
    };

    const handleAddReply = (commentId, content) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: [
                        ...comment.replies,
                        {
                            id: uuidv4(),
                            content,
                            author: 'Guest User', // In a real app, get the user's name from auth
                            date: new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })
                        }
                    ]
                };
            }
            return comment;
        });

        setComments(updatedComments);
    };

    const handleDeleteComment = (commentId) => {
        const updatedComments = comments.filter(comment => comment.id !== commentId);
        setComments(updatedComments);
    };

    const handleDeleteReply = (commentId, replyId) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: comment.replies.filter(reply => reply.id !== replyId)
                };
            }
            return comment;
        });
        setComments(updatedComments);
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