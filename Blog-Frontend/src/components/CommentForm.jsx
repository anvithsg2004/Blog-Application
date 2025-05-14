import React, { useState } from 'react';

const CommentForm = ({ onSubmit, isReply = false, onCancel }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isReply ? "Write a reply..." : "Join the conversation..."}
                className="w-full p-3 bg-[#111] border border-[rgba(229,228,226,0.3)] text-[rgba(229,228,226,0.8)] focus:outline-none focus:ring-1 focus:ring-white mb-3"
                rows={isReply ? 2 : 4}
            />
            <div className="flex gap-3 justify-end">
                {isReply && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-transparent border border-[rgba(229,228,226,0.5)] text-[rgba(229,228,226,0.8)] hover:text-white hover:border-white transition-brutal"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black hover:bg-[#f0f0f0] transition-brutal"
                >
                    {isReply ? 'Reply' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
};

export default CommentForm;