import React, { useState, useEffect } from "react";
import {
  FaThumbsUp,
  FaComment,
  FaPaperPlane,
  FaStar,
  FaEllipsisH,
  FaGlobeAmericas,
} from "react-icons/fa";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

function Discuss({
  docId,
  deptId,
  uploaderName,
  uploaderImage,
  currentUserEmail,
  currentUserName,
  currentUserImage,
  message,
  pdfUrl,
  courseName,
  courseCode,
  initialLikes = [],
  initialComments = [],
  initialRatings = {},
}) {
  const [likedBy, setLikedBy] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [ratings, setRatings] = useState(initialRatings);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const materialRef = doc(db, "studyMaterials", deptId, "Materials", docId);

  useEffect(() => {
    const unsubscribe = onSnapshot(materialRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikedBy(data.likedBy || []);
        setComments(data.comments || []);
        setRatings(data.ratings || {});
      }
    });
    return () => unsubscribe();
  }, [docId, deptId]);

  const handleLike = async () => {
    const hasLiked = likedBy.includes(currentUserEmail);
    const updatedLikes = hasLiked
      ? likedBy.filter((e) => e !== currentUserEmail)
      : [...likedBy, currentUserEmail];
    await updateDoc(materialRef, { likedBy: updatedLikes });
  };

  const handleRate = async (star) => {
    const updatedRatings = { ...ratings, [currentUserEmail]: star };
    await updateDoc(materialRef, { ratings: updatedRatings });
  };

  const avgRating = Object.values(ratings).length
    ? (
        Object.values(ratings).reduce((a, b) => a + b, 0) /
        Object.values(ratings).length
      ).toFixed(1)
    : "0.0";

  const formatTime = (dateObj) => {
    if (!dateObj) return "Just now";
    const date = new Date(dateObj);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const addReplyToNested = (list, parentId, newReply) => {
    return list.map((item) => {
      if (item.id === parentId) {
        return { ...item, replies: [...(item.replies || []), newReply] };
      }
      if (item.replies?.length > 0) {
        return { ...item, replies: addReplyToNested(item.replies, parentId, newReply) };
      }
      return item;
    });
  };

  const updateCommentNested = (list, id, newText) => {
    return list.map((item) => {
      if (item.id === id) return { ...item, text: newText };
      if (item.replies?.length > 0) return { ...item, replies: updateCommentNested(item.replies, id, newText) };
      return item;
    });
  };

  const deleteCommentNested = (list, id) => {
    return list
      .filter((item) => item.id !== id)
      .map((item) => item.replies ? { ...item, replies: deleteCommentNested(item.replies, id) } : item);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    // If editing an existing comment
    if (editingCommentId) {
      const updatedComments = updateCommentNested(comments, editingCommentId, commentText);
      await updateDoc(materialRef, { comments: updatedComments });
      setEditingCommentId(null);
      setCommentText("");
      setReplyTo(null);
      return;
    }

    // New comment or reply
    const newEntry = {
      id: `com-${Date.now()}`,
      userEmail: currentUserEmail,
      userName: currentUserName,
      userProfile: currentUserImage,
      text: commentText,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    let updatedComments = [...comments];
    if (replyTo) {
      updatedComments = addReplyToNested(updatedComments, replyTo, newEntry);
    } else {
      updatedComments.push(newEntry);
    }

    await updateDoc(materialRef, { comments: updatedComments });
    setCommentText("");
    setReplyTo(null);
  };

  const renderComments = (commentList, isReply = false) => {
    return commentList.map((c) => (
      <div key={c.id} className={`flex gap-2 relative ${isReply ? "mt-2 ml-10" : "mt-4"}`}>
        <div className={`absolute ${isReply ? "-left-5" : "left-4"} top-0 bottom-0 w-[2px] bg-gray-300`}></div>
        <img src={c.userProfile || "https://ui-avatars.com/api/?name=User"} className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full object-cover z-10`} alt="" />
        <div className="flex-1">
          <div className="bg-[#F0F2F5] px-3 py-2 rounded-[18px] inline-block max-w-full">
            <h5 className="text-[13px] font-bold text-gray-900 leading-tight">{c.userName}</h5>
            <p className="text-[14px] text-gray-800 leading-snug mt-0.5">{c.text}</p>
          </div>
          <div className="flex gap-3 text-[12px] font-bold text-[#65676B] mt-1 ml-3">
            <button
              className="hover:underline"
              onClick={() => {
                setReplyTo(c.id);
                setCommentText(`@${c.userName} `);
                setEditingCommentId(null);
              }}
            >
              Reply
            </button>
            <span className="font-normal">{formatTime(c.createdAt)}</span>

            {c.userEmail === currentUserEmail && (
              <>
                <button
                  className="hover:underline text-red-500"
                  onClick={async () => {
                    const updated = deleteCommentNested(comments, c.id);
                    await updateDoc(materialRef, { comments: updated });
                    if (editingCommentId === c.id) setCommentText("");
                  }}
                >
                  Delete
                </button>
                <button
                  className="hover:underline text-blue-500"
                  onClick={() => {
                    setEditingCommentId(c.id);
                    setCommentText(c.text);
                    setReplyTo(null);
                  }}
                >
                  Edit
                </button>
              </>
            )}
          </div>

          {replyTo === c.id && !editingCommentId && (
            <div className="flex gap-2 mt-2 items-center ml-5">
              <img src={currentUserImage} className="w-6 h-6 rounded-full" alt="" />
              <div className="flex-1 flex bg-[#F0F2F5] rounded-full px-3 py-1 items-center border">
                <input
                  autoFocus
                  className="bg-transparent border-none flex-1 text-[13px] outline-none"
                  placeholder="Write a reply..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                />
                <button onClick={submitComment} className="text-[#65676B] hover:text-blue-600 ml-2">
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </div>
          )}

          {c.replies?.length > 0 && renderComments(c.replies, true)}
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm w-full max-w-[680px] mx-auto mb-6 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-start p-3 px-4">
        <div className="flex items-center gap-2">
          <img src={uploaderImage} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
          <div className="flex flex-col">
            <h4 className="font-bold text-[15px] text-[#050505]">{uploaderName}</h4>
            <div className="flex items-center text-[13px] text-[#65676B] gap-1">
              <span>{courseCode}</span> • <FaGlobeAmericas size={12} />
            </div>
          </div>
        </div>
        <button className="text-[#65676B] hover:bg-gray-100 p-2 rounded-full"><FaEllipsisH size={16} /></button>
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 py-2 text-[15px] text-[#050505]">
        <div className="font-bold text-blue-800 text-[13px] mb-1">{courseName}</div>
        {message}
      </div>

      {pdfUrl && (
        <div className="bg-black border-y border-gray-200 mt-2">
          <iframe src={pdfUrl.replace(/\/view.*|\/edit.*/, "/preview")} className="w-full h-[450px]" title="Preview" />
        </div>
      )}

      {/* STATS BAR */}
      <div className="px-4 py-2 flex justify-between items-center text-[14px] text-[#65676B] border-b mx-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 rounded-full p-1 text-white text-[8px]"><FaThumbsUp /></div>
          <span>{likedBy.length}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">{comments.length} comments</button>
          <span>★ {avgRating} Avg</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center px-4 py-1 border-b mx-3">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 font-semibold text-[14px] ${likedBy.includes(currentUserEmail) ? "text-blue-600" : "text-[#65676B]"}`}>
          <FaThumbsUp /> Like
        </button>

        <button onClick={() => setShowComments(!showComments)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 font-semibold text-[14px] ${showComments ? "text-blue-600" : "text-[#65676B]"}`}>
          <FaComment /> Comment
        </button>

        <div className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md hover:bg-gray-50 transition-colors">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={16}
              onClick={() => handleRate(star)}
              className={`cursor-pointer transition-transform active:scale-125 ${ratings[currentUserEmail] >= star ? "text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Comment Input */}
          <div className="flex gap-2 mt-4">
            <img src={currentUserImage} className="w-8 h-8 rounded-full" alt="" />
            <div className="flex-1 flex bg-[#F0F2F5] rounded-[20px] px-3 items-center border border-transparent focus-within:border-gray-300">
              <input
                className="bg-transparent border-none flex-1 text-[14px] outline-none py-2"
                placeholder="Write a comment..."
                value={!replyTo ? commentText : ""}
                onChange={(e) => { setReplyTo(null); setCommentText(e.target.value); setEditingCommentId(null); }}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              />
              <button onClick={submitComment} className="text-[#65676B] hover:text-blue-600">
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>

          {/* Render Comments */}
          <div className="mt-2">
            {renderComments(showAllComments ? comments : comments.slice(0, 2))}
            {comments.length > 2 && !showAllComments && (
              <p
                onClick={() => setShowAllComments(true)}
                className="text-blue-600 text-[13px] font-semibold mt-1 cursor-pointer hover:underline ml-10"
              >
                Show all comments
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Discuss;