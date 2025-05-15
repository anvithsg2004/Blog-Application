import React, { useState, useContext } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import CommentForm from './CommentForm';
import { AuthContext } from '../components/AuthContext';

const CommentItem = ({ comment, onAddReply, onDeleteComment, onDeleteReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useContext(AuthContext);

    const handleReply = (content) => {
        onAddReply(comment.id, content);
        setIsReplying(false);
    };

    const canDeleteComment = user && comment.authorEmail === user.name;
    const canDeleteReply = (reply) => user && reply.authorEmail === user.name;

    return (
        <div className="mb-10 last:mb-0">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white">{comment.authorEmail}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[rgba(229,228,226,0.5)]">{comment.createdAt}</span>
                        {canDeleteComment && (
                            <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-[rgba(229,228,226,0.8)]">{comment.content}</p>
                <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="mt-3 flex items-center gap-2 text-sm text-[rgba(229,228,226,0.6)] hover:text-white"
                >
                    <MessageCircle size={16} />
                    Reply
                </button>
            </div>

            {isReplying && (
                <div className="ml-6 border-l-2 border-[rgba(229,228,226,0.2)] pl-4 mt-4">
                    <CommentForm
                        onSubmit={handleReply}
                        isReply={true}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Display replies */}
            {comment.replies.length > 0 && (
                <div className="ml-6 border-l-2 border-[rgba(229,228,226,0.2)] pl-4">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white">{reply.authorEmail}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[rgba(229,228,226,0.5)]">{reply.createdAt}</span>
                                    {canDeleteReply(reply) && (
                                        <button
                                            onClick={() => onDeleteReply(comment.id, reply.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-[rgba(229,228,226,0.8)]">{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
