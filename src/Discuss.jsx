import React, { useState } from "react";
import { FaThumbsUp, FaComment, FaStar, FaReply, FaEdit, FaTrash } from "react-icons/fa";

function Discuss({
  user,
  firstName,
  profilePic,
  message,
  time,
  pdfUrl,
  courseName,
  courseCode,
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  
  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: "You",
      message: newComment,
      time: "Just now",
      replies: [],
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  
  const addReply = (parentId, replyingToName, text) => {
    if (!text.trim()) return;

    const recursiveReply = (items) =>
      items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            replies: [
              ...item.replies,
              {
                id: Date.now(),
                user: "You",
                message: text,
                time: "Just now",
                replyingTo: replyingToName,
                replies: [],
              },
            ],
          };
        } else if (item.replies.length > 0) {
          return { ...item, replies: recursiveReply(item.replies) };
        }
        return item;
      });

    setComments(recursiveReply(comments));
  };

  
  const deleteComment = (commentId) => {
    const recursiveDelete = (items) =>
      items
        .filter((item) => item.id !== commentId)
        .map((item) =>
          item.replies.length > 0
            ? { ...item, replies: recursiveDelete(item.replies) }
            : item
        );

    setComments(recursiveDelete(comments));
  };

  
  const editComment = (commentId, newText) => {
    const recursiveEdit = (items) =>
      items.map((item) => {
        if (item.id === commentId) {
          return { ...item, message: newText };
        } else if (item.replies.length > 0) {
          return { ...item, replies: recursiveEdit(item.replies) };
        }
        return item;
      });

    setComments(recursiveEdit(comments));
  };

  
  const countComments = (items) =>
    items.reduce(
      (acc, c) => acc + 1 + (c.replies.length > 0 ? countComments(c.replies) : 0),
      0
    );

  
  const CommentItem = ({ comment, depth = 0 }) => {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.message);

    return (
      <li className={`mb-2 ${depth > 0 ? "pl-6 border-l border-gray-200" : ""}`}>
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold text-gray-800">{comment.user}</p>
            <span className="text-xs text-gray-400">{comment.time}</span>
          </div>

          {editing ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => {
                  editComment(comment.id, editText);
                  setEditing(false);
                }}
                className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm hover:bg-green-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-gray-700 text-sm">
              {comment.replyingTo && (
                <span className="text-blue-500">@{comment.replyingTo} </span>
              )}
              {comment.message}
            </p>
          )}

          <div className="flex gap-3 mt-1 text-xs text-blue-500">
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 hover:underline"
            >
              <FaReply /> Reply
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 hover:underline"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              className="flex items-center gap-1 hover:underline text-red-500"
            >
              <FaTrash /> Delete
            </button>
          </div>

          {replying && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={`Reply to ${comment.user}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => {
                  addReply(comment.id, comment.user, replyText);
                  setReplyText("");
                  setReplying(false);
                }}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-all text-sm"
              >
                Reply
              </button>
            </div>
          )}

          
          {comment.replies.length > 0 && (
            <ul className="mt-2 space-y-2">
              {comment.replies.map((r) => (
                <CommentItem key={r.id} comment={r} depth={depth + 1} />
              ))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-lg transition-all mb-6">
      
      <div className="flex items-start mb-3 gap-3">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-800">{user}</p>
            <span className="text-xs text-gray-400">{time}</span>
          </div>

          
          <div className="p-2 bg-gray-100 rounded-lg mb-1 flex flex-row items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{courseName}</span>
            <span className="text-xs text-gray-500">{courseCode}</span>
          </div>
        </div>
      </div>

      
      <p className="text-gray-700 mb-4">{message}</p>

      
      {pdfUrl && (
        <div className="border border-gray-300 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 shadow-sm p-2">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="w-full h-96 rounded-lg border"
          ></iframe>
        </div>
      )}

      
      <div className="flex justify-between items-center mt-2 mb-2">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all ${
            liked ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          <FaThumbsUp /> Like ({likeCount})
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        >
          <FaComment /> Discuss ({countComments(comments)})
        </button>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
          <span className="text-gray-600 text-sm ml-1">({rating}/5)</span>
        </div>
      </div>

      
      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Post
            </button>
          </div>

          <ul className="space-y-3 max-h-96 overflow-y-scroll no-scrollbar">
            {comments.length === 0 && (
              <li className="text-gray-400 text-sm">No comments yet</li>
            )}
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </ul>
        </div>
      )}

      
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `}
      </style>
    </div>
  );
}

export default Discuss;
