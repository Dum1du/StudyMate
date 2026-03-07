import React, { useEffect, useState } from "react";
import { Download, Star, User } from "lucide-react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { FaStar, FaPaperPlane } from "react-icons/fa"; // Added FaPaperPlane

const ResourcePage = () => {
  const { resourceId } = useParams();
  const location = useLocation();
  const resource = location.state?.resource;

  const [userDoc, setUserDoc] = useState(null);
  const [userName, setUserName] = useState("Unknown User");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);

  // --- Comment & Discussion States ---
  const [comments, setComments] = useState(resource?.comments || []);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({
    displayName: "",
    photoURL: "",
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentRef, setEditingCommentRef] = useState(null);
  // ----------------------------------------

  const averageRating = resource?.avgRating || 0;
  const ratingCount = resource?.ratingCount || 0;
  const currentUser = auth.currentUser;
  const [ratings, setRatings] = useState(resource?.ratings || {});

  const dept = resource?.courseCode?.slice(0, 3);

  const materialRef = doc(db, "studyMaterials", dept, "Materials", resourceId);
  const ratingRef =
    dept && resourceId && currentUser
      ? doc(
          db,
          "studyMaterials",
          dept,
          "Materials",
          resourceId,
          "ratings",
          currentUser.uid,
        )
      : null;

  const handleRate = async (star) => {
    if (!auth.currentUser) {
      alert("Please login to rate");
      return;
    }

    if (!ratingRef) return;

    try {
      await runTransaction(db, async (transaction) => {
        const materialDoc = await transaction.get(materialRef);
        const ratingDoc = await transaction.get(ratingRef);

        const materialData = materialDoc.data();

        let avgRating = materialData.avgRating || 0;
        let ratingCount = materialData.ratingCount || 0;

        if (ratingDoc.exists()) {
          const oldRating = ratingDoc.data().rating;
          const newAvg =
            (avgRating * ratingCount - oldRating + star) / ratingCount;
          transaction.update(materialRef, { avgRating: newAvg });
        } else {
          const newAvg = (avgRating * ratingCount + star) / (ratingCount + 1);
          transaction.update(materialRef, {
            avgRating: newAvg,
            ratingCount: ratingCount + 1,
          });
        }
        transaction.set(ratingRef, { rating: star });
      });
      console.log("Rating saved");
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  useEffect(() => {
    if (!resource) {
      alert("No resource data found. Redirecting to browse page.");
      return <Navigate to="/browseresources" />;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", resource.uploaderUid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserDoc(userDocSnap.data());
          setUserName(userDocSnap.data().displayName || "Unknown User");
          fetchQuiz();
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [resource, Navigate]);

  // Fetch Logged-In User Profile for Commenting
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        const loggedInUserDoc = await getDoc(doc(db, "users", user.uid));
        if (loggedInUserDoc.exists()) {
          setCurrentUserProfile({
            displayName: loggedInUserDoc.data().displayName,
            photoURL: loggedInUserDoc.data().profilePicture,
          });
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Load Comments on Page Load
  useEffect(() => {
    if (!dept || !resourceId) return;
    loadComments();
  }, [dept, resourceId]);

  const formatTime = (dateObj) => {
    if (!dateObj) return "Just now";
    const date = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Build Reply Tree
  const buildReplyTree = (replies) => {
    const map = {};
    const roots = [];
    replies.forEach((r) => {
      map[r.id] = { ...r, replies: [] };
    });
    replies.forEach((r) => {
      if (r.parentReplyId) {
        map[r.parentReplyId]?.replies.push(map[r.id]);
      } else {
        roots.push(map[r.id]);
      }
    });
    return roots;
  };

  // Load Comments
  const loadComments = async () => {
    try {
      const commentsRef = collection(materialRef, "comments");
      const snapshot = await getDocs(
        query(commentsRef, orderBy("createdAt", "asc")),
      );
      const commentList = [];
      for (const docSnap of snapshot.docs) {
        const commentData = {
          id: docSnap.id,
          ref: docSnap.ref,
          ...docSnap.data(),
          replies: [],
        };
        const repliesRef = collection(docSnap.ref, "replies");
        const replySnap = await getDocs(
          query(repliesRef, orderBy("createdAt", "asc")),
        );

        // Just map them directly without recursion
      commentData.replies = replySnap.docs.map((r) => ({
        id: r.id,
        ref: r.ref,
        commentId: docSnap.id, // Reference to the top-level parent
        ...r.data(),
      }));
        
        commentList.push(commentData);
      }
      setComments(commentList);
    } catch (err) {
      console.error("Failed loading comments", err);
    }
  };

  // Submit Comment / Reply
  const submitComment = async () => {
    if (!commentText.trim()) return;
    if (!auth.currentUser) {
      alert("Please login to comment.");
      return;
    }
    setSubmittingComment(true);
    try {
      if (editingCommentRef) {
        await updateDoc(editingCommentRef, { text: commentText });
        setEditingCommentRef(null);
        setCommentText("");
        setReplyTo(null);
        loadComments();
        return;
      }
      if (!replyTo) {
        const commentsRef = collection(materialRef, "comments");
        await addDoc(commentsRef, {
          userEmail: currentUserEmail,
          userName: currentUserProfile.displayName || "User",
          userProfile: currentUserProfile.photoURL || "",
          text: commentText,
          createdAt: serverTimestamp(),
        });
      } else {
        const repliesRef = collection(
          materialRef,
          "comments",
          replyTo.commentId,
          "replies",
        );
        await addDoc(repliesRef, {
          userEmail: currentUserEmail,
          userName: currentUserProfile.displayName || "User",
          userProfile: currentUserProfile.photoURL || "",
          text: commentText,
          createdAt: serverTimestamp(),
          parentReplyId: replyTo.parentReplyId || null,
        });
      }
      setCommentText("");
      setReplyTo(null);
      setEditingCommentRef(null);
      loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Comment
  const deleteComment = async (ref) => {
    try {
      await deleteDoc(ref);
      loadComments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleReplyClick = (comment) => {
    setReplyTo({
      commentId: comment.commentId || comment.id,
      parentReplyId: comment.commentId ? comment.id : null,
      author: comment.userName,
    });

    setCommentText(`@${comment.userName} `);

    // Smooth scroll/focus to input
  const input = document.getElementById("comment-input");
  input?.focus();
  };

  // Render Comments
  const renderComments = (commentList) => {
  return commentList.map((c) => (
    <div key={c.id} className="mt-6">
      {/* TOP LEVEL COMMENT */}
      <div className="flex gap-3 sm:ml-10">
        <img
          src={c.userProfile || "https://ui-avatars.com/api/?name=User"}
          className="w-10 h-10 rounded-full border shadow-sm"
          alt=""
        />
        <div className="flex-1">
          <div className="bg-gray-100 px-4 py-2 rounded-2xl inline-block max-w-full">
            <h5 className="text-[13px] font-bold text-gray-900">{c.userName}</h5>
            <p className="text-[14px] text-gray-800 mt-1 whitespace-pre-wrap">{c.text}</p>
          </div>
          <div className="flex gap-3 text-[12px] font-bold text-gray-500 mt-1 ml-2">
            <button className="hover:underline" onClick={() => handleReplyClick(c)}>Reply</button>
            <span className="font-normal">{formatTime(c.createdAt)}</span>
            {c.userEmail === currentUserEmail && (
              <button className="text-red-500 hover:underline" onClick={() => deleteComment(c.ref)}>Delete</button>
            )}
          </div>

          {/* SECOND LEVEL REPLIES (FLAT) */}
          {c.replies?.length > 0 && (
            <div className="mt-3 ml-10 space-y-4 border-l-2 border-gray-100 pl-4 sm:pl-10">
              {c.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <img
                    src={reply.userProfile || "https://ui-avatars.com/api/?name=User"}
                    className="w-8 h-8 rounded-full border shadow-sm"
                    alt=""
                  />
                  <div className="flex-1">
                    <div className="bg-blue-50/50 px-3 py-1.5 rounded-xl inline-block max-w-full border border-blue-100/50 ">
                      <h5 className="text-[12px] font-bold text-gray-900">{reply.userName}</h5>
                      <p className="text-[13px] text-gray-800 whitespace-pre-wrap">
                        {/* Highlights the @mention if you want, or just leave as text */}
                        {reply.text}
                      </p>
                    </div>
                    <div className="flex gap-3 text-[11px] font-bold text-gray-500 mt-0.5 ml-2">
                      <button className="hover:underline" onClick={() => handleReplyClick(reply)}>Reply</button>
                      <span className="font-normal">{formatTime(reply.createdAt)}</span>
                      {reply.userEmail === currentUserEmail && (
                        <button className="text-red-500 hover:underline" onClick={() => deleteComment(reply.ref)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ));
};

  // --- QUIZ LOGIC (UNTOUCHED) ---
  const fetchQuiz = async () => {
    const quizRef = collection(
      db,
      "studyMaterials",
      dept,
      "Materials",
      resourceId,
      "Quizes",
    );
    const q = query(quizRef, orderBy("createdAt"));
    const quizSnap = await getDocs(q);

    const quizData = quizSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuizQuestions(quizData);
  };

  useEffect(() => {
    if (quizQuestions.length > 0) {
      setAnswers(
        quizQuestions.map(() => ({
          selected: null,
          answered: false,
        })),
      );
    }
  }, [quizQuestions]);

  useEffect(() => {
    if (showQuiz) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showQuiz]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <p className="text-lg font-semibold text-blue-600">
              {resource.courseCode}
            </p>
            <div className="sm:flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {resource?.resourceTitle || "Resource Title"}
                </h1>
                <p className="text-gray-500 mt-2">
                  {resource?.description || "No description available."}
                </p>
              </div>
              <div className="justify-items-end">
                <button
                  className="flex items-center gap-2 bg-blue-600 text-white sm:px-5 px-5 py-2 cursor-pointer rounded-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => {
                    if (resource.fileId) {
                      const downloadUrl = `https://drive.google.com/uc?export=download&id=${resource.fileId}`;
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download =
                        resource.resourceTitle +
                        (resource.materialType || ".pdf");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert("No download link available for this resource.");
                    }
                  }}
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>

            {/* Document Preview Placeholder */}
            <div className="mt-8 w-full h-96 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              {resource.fileLink ? (
                <iframe
                  src={resource.fileLink.replace(
                    /\/view.*|\/edit.*/,
                    "/preview",
                  )}
                  className="w-full h-full left-0 top-0"
                  title="Preview"
                />
              ) : (
                <p>No Preview</p>
              )}
            </div>
          </div>

          {/* Quiz Section (UNTOUCHED) */}
          {loading ? (
            <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-100 blur-sm animate-pulse">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🧠 Test Your Understanding
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This quiz was automatically generated from the resource content.
              </p>
              <button
                className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600"
                onClick={() => setShowQuiz(true)}
              >
                Start Quiz
              </button>
            </div>
          ) : (
            quizQuestions.length > 0 && (
              <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🧠 Test Your Understanding
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This quiz was automatically generated from the resource
                  content.
                </p>
                <button
                  className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600"
                  onClick={() => setShowQuiz(true)}
                >
                  Start Quiz
                </button>
              </div>
            )
          )}

          {/* QUize Model (UNTOUCHED) */}
          {showQuiz &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                  onClick={() => setShowQuiz(false)}
                />
                <div className="fixed inset-0 z-50 flex justify-center items-start p-4 overflow-y-auto">
                  <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl p-8 my-8">
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                    >
                      ✕
                    </button>
                    <h2 className="text-2xl font-bold mb-2">
                      Quiz: {resource?.resourceTitle}
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Test your understanding of this material.
                    </p>

                    {quizQuestions.length === 0 ? (
                      <p className="text-gray-500">Loading quiz...</p>
                    ) : (
                      <div className="space-y-6">
                        {quizQuestions.map((q, qIndex) => {
                          const answerState = answers[qIndex] || {
                            selected: null,
                            answered: false,
                          };
                          return (
                            <div
                              key={q.id}
                              className="space-y-2 p-4 border rounded-lg bg-gray-50"
                            >
                              <p className="font-semibold text-lg">
                                {qIndex + 1}. {q.question}
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt, i) => {
                                  let bgColor = "bg-white";
                                  if (answerState.answered) {
                                    if (opt === q.answer)
                                      bgColor = "bg-green-200";
                                    else if (
                                      opt === answerState.selected &&
                                      opt !== q.answer
                                    )
                                      bgColor = "bg-red-200";
                                  } else if (opt === answerState.selected) {
                                    bgColor = "bg-gray-200";
                                  }
                                  return (
                                    <button
                                      key={i}
                                      disabled={answerState.answered}
                                      className={`w-full border rounded-lg p-3 text-left hover:bg-gray-100 transition ${bgColor}`}
                                      onClick={() => {
                                        const newAnswers = [...answers];
                                        newAnswers[qIndex] = {
                                          selected: opt,
                                          answered: true,
                                        };
                                        setAnswers(newAnswers);
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>,
              document.body,
            )}

          {/* Dynamic Discussion / Comment Section (Upgraded to handle nested replies) */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl  p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Discussion ({comments.length})
            </h3>

            {/* Recursive Comments List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">
                    No comments yet. Be the first to start the discussion!
                  </p>
                </div>
              ) : (
                renderComments(comments)
              )}
            </div>

            {/* Main Comment Input Box */}
            <div className="flex gap-4 mt-8 mb-8 max-h-10">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300">
                <img
                  src={
                    currentUserProfile.photoURL ||
                    `https://ui-avatars.com/api/?name=${currentUserProfile.displayName || "U"}&background=EBF4FF&color=1E3A8A`
                  }
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-3">
                {replyTo && (
                  <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 mb-2">
                    <p className="text-sm text-blue-700">
                      Replying to{" "}
                      <span className="font-bold">{replyTo.author}</span>
                    </p>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-bold uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                  }}
                  className="w-full rounded-xl border border-gray-300 p-1 sm:p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-10 sm:max-h-20 resize-y bg-gray-50 hover:bg-white transition-colors"
                  placeholder={
                    replyTo
                      ? `Replying to ${replyTo.author}...`
                      : "Write a comment..."
                  }
                />
                <div className="flex justify-end">
                  <button
                    onClick={submitComment}
                    disabled={
                      submittingComment ||
                      (commentText.trim() === "" && !replyTo)
                    }
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* ------------------------------------------------ */}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Uploaded By Card */}
          {loading ? (
            <div className="bg-cyan-100 rounded-xl p-6 blur-sm animate-pulse">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                Uploaded by
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center shadow-sm overflow-hidden">
                  <img
                    className="w-full h-full"
                    src={
                      userDoc?.profilePicture || (
                        <User className="text-gray-400" />
                      )
                    }
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-600 uppercase">
                    {userDoc?.program || userDoc?.email}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cyan-100 rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                Uploaded by
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center shadow-sm overflow-hidden">
                  <img
                    className="w-full h-full"
                    src={
                      userDoc?.profilePicture || (
                        <User className="text-gray-400" />
                      )
                    }
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-600 uppercase">
                    {userDoc?.program || userDoc?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating Card */}
          <div className="bg-purple-100 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
              Rating
            </h3>

            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-gray-800">
                {Number(averageRating).toFixed(1)}
              </span>

              <div className="flex flex-col">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const displayRating =
                      hover || ratings?.[currentUserEmail] || averageRating;
                    return (
                      <FaStar
                        key={star}
                        size={22}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className={`cursor-pointer transition-all duration-150 hover:scale-125 ${
                          displayRating >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {ratingCount} reviews
                </p>
                <span className="text-xs text-purple-600 font-medium mt-1">
                  Click a star to rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
