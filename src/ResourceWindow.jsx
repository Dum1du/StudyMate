import React, { useEffect, useRef, useState } from "react";
import { Download, Star, User, Bookmark, ShieldCheck, ShieldOff, Flag, X } from "lucide-react"; 
import { Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
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
  limit,
  setDoc,
  increment,
  startAfter,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { FaStar, FaPaperPlane } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import AlertModal from "./AlertModal"; 
import axios from "axios"; 
import PublicProfileModal from "./PublicProfileModal";
import PublicProfileModal from "./PublicProfileModal";

const ResourcePage = () => {
  const { resourceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [resourceData, setResourceData] = useState(location.state?.resource || null);

  const [userDoc, setUserDoc] = useState(null);
  const [userName, setUserName] = useState("Unknown User");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  // --- Public Profile Modal State ---
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // --- Public Profile Modal State ---
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const [comments, setComments] = useState(resourceData?.comments || []);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
  const [prefetchedReplies, setPrefetchedReplies] = useState({}); 
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({
    displayName: "",
    photoURL: "",
    role: "student" 
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentRef, setEditingCommentRef] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [lastCommentDoc, setLastCommentDoc] = useState(null);
  const COMMENTS_PAGE_SIZE = 5;

  const averageRating = resourceData?.avgRating || 0;
  const ratingCount = resourceData?.ratingCount || 0;
  const currentUser = auth.currentUser;
  const [ratings, setRatings] = useState({}); 
  const prefetchedRepliesRef = useRef({});

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const dept = resourceData?.courseCode?.slice(0, 3).toUpperCase();

  const materialRef = dept && resourceId ? doc(db, "studyMaterials", dept, "Materials", resourceId) : null;
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

  useEffect(() => {
    const checkSaved = async () => {
      const user = auth.currentUser;
      if (user && resourceId) {
        try {
          const docRef = doc(
            db,
            "users",
            user.uid,
            "savedResources",
            resourceId,
          );
          const docSnap = await getDoc(docRef);
          setIsSaved(docSnap.exists());
        } catch (err) {
          console.error("Error checking saved status:", err);
        }
      }
    };
    checkSaved();
  }, [resourceId, currentUserEmail]);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setAlertConfig({ isOpen: true, title: "Login Required", message: "Please login to save resources.", type: "warning" });
      return;
    }

    try {
      const docRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "savedResources",
        resourceId,
      );
      if (isSaved) {
        await deleteDoc(docRef);
        setIsSaved(false);
      } else {
        const resourceDataToSave = {
          ...resourceData,
          savedAt: serverTimestamp(),
          pinned: false,
        };
        await setDoc(docRef, resourceDataToSave);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      setAlertConfig({ isOpen: true, title: "Error", message: "Failed to update saved resources.", type: "error" });
    }
  };

  const handleRate = async (star) => {
    if (!auth.currentUser) {
      setAlertConfig({ isOpen: true, title: "Login Required", message: "Please login to rate this resource.", type: "warning" });
      return;
    }

    if (!ratingRef) return;

    try {
      let updatedAvg = 0;
      let updatedCount = 0;

      await runTransaction(db, async (transaction) => {
        const materialDoc = await transaction.get(materialRef);
        const ratingDoc = await transaction.get(ratingRef);

        const materialData = materialDoc.data();

        let avgRating = materialData.avgRating || 0;
        let ratingCount = materialData.ratingCount || 0;

        if (ratingDoc.exists()) {
          const oldRating = ratingDoc.data().rating;
          updatedAvg = (avgRating * ratingCount - oldRating + star) / ratingCount;
          updatedCount = ratingCount;
          transaction.update(materialRef, { avgRating: updatedAvg });
        } else {
          updatedCount = ratingCount + 1;
          updatedAvg = (avgRating * ratingCount + star) / updatedCount;
          transaction.update(materialRef, {
            avgRating: updatedAvg,
            ratingCount: updatedCount,
          });
        }
        transaction.set(ratingRef, { rating: star });
      });

      setResourceData((prev) => ({
        ...prev,
        avgRating: updatedAvg,
        ratingCount: updatedCount,
      }));

      setRatings((prev) => ({
        ...prev,
        [currentUserEmail]: star,
      }));

    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  // --- FIXED: Toggle Approval Status ---
  const toggleApproval = async () => {
    if (currentUserProfile.role !== "teacher" || !materialRef) return;
    
    const newApprovalStatus = !resourceData?.isApproved;
    
    try {
      await updateDoc(materialRef, { isApproved: newApprovalStatus });
      setResourceData((prev) => ({ ...prev, isApproved: newApprovalStatus }));
      
      setAlertConfig({
        isOpen: true,
        title: newApprovalStatus ? "Material Approved" : "Approval Revoked",
        message: newApprovalStatus 
          ? "You have successfully approved this material." 
          : "You have removed the teacher approval from this material.",
        type: newApprovalStatus ? "success" : "info"
      });
    } catch (error) {
      console.error("Error updating approval status:", error);
      setAlertConfig({ isOpen: true, title: "Error", message: "Failed to update approval status.", type: "error" });
    }
  };

  const handleReportAction = () => {
    if (!auth.currentUser) {
      setAlertConfig({ isOpen: true, title: "Login Required", message: "Please login to report resources.", type: "warning" });
      return;
    }
    setIsReportModalOpen(true);
  };

  const submitReportAction = async () => {
    if (!reportReason.trim()) return;
    setReporting(true);
    
    if (currentUserProfile.role === "teacher") {
      try {
        const token = await auth.currentUser.getIdToken();
        
        await axios.delete(`http://localhost:4000/delete-upload/${resourceId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { diptId: dept }
        });

        await deleteDoc(doc(db, "discussions", resourceId));

        if (resourceData?.uploaderUid) {
          const batch = writeBatch(db);
          const mainNotifRef = doc(collection(db, "notifications"));
          const message = `Your material "${resourceData.resourceTitle}" was deleted by a teacher. Reason: ${reportReason}`;
          
          batch.set(mainNotifRef, {
            title: "Material Deleted",
            message: message,
            createdAt: serverTimestamp(),
            type: "alert",
            targetId: null
          });

          const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", resourceData.uploaderUid);
          batch.set(userNotifRef, {
            userId: resourceData.uploaderUid,
            message: message,
            read: false,
            createdAt: serverTimestamp(),
            type: "alert",
            targetId: null
          });

          await batch.commit();
        }

        setIsReportModalOpen(false);
        setAlertConfig({ 
          isOpen: true, 
          title: "Material Deleted", 
          message: "Material deleted successfully and the uploader has been notified.", 
          type: "success",
          onConfirm: () => navigate("/browseresources")
        });

      } catch (error) {
        console.error("Error deleting material:", error);
        setAlertConfig({ isOpen: true, title: "Error", message: "Failed to delete material.", type: "error" });
      }
    } else {
      try {
        await addDoc(collection(db, "reportedMaterials"), {
          materialId: resourceId,
          deptId: dept,
          resourceTitle: resourceData?.resourceTitle || "Untitled",
          courseCode: resourceData?.courseCode || "N/A",
          reportedByUid: auth.currentUser.uid,
          reportedByEmail: currentUserEmail,
          reportedByName: currentUserProfile.displayName || "Unknown",
          reason: reportReason,
          uploaderUid: resourceData?.uploaderUid || null,
          createdAt: serverTimestamp(),
        });
        setIsReportModalOpen(false);
        setReportReason("");
        setAlertConfig({
          isOpen: true,
          title: "Report Sent",
          message: "This material has been reported to the admins for review.",
          type: "success"
        });
      } catch (error) {
        console.error("Error reporting material:", error);
        setAlertConfig({ isOpen: true, title: "Error", message: "Failed to send report. Please try again.", type: "error" });
      } 
    }
    setReporting(false);
  };

  useEffect(() => {
    if (!resourceData && !resourceId) {
      setAlertConfig({
        isOpen: true,
        title: "Not Found",
        message: "No resource data found. Redirecting to browse page.",
        type: "warning",
        onConfirm: () => navigate("/browseresources")
      });
      return;
    }

    const fetchEverything = async () => {
      setLoading(true);
      let currentResource = resourceData ? { ...resourceData } : null;
      let targetDept = dept; 

      if (resourceId) {
        try {
          let matSnap = null;

          if (currentResource?.courseCode) {
            targetDept = currentResource.courseCode.slice(0, 3).toUpperCase();
            const matRef = doc(db, "studyMaterials", targetDept, "Materials", resourceId);
            matSnap = await getDoc(matRef);
          } else {
            const discRef = doc(db, "discussions", resourceId);
            const discSnap = await getDoc(discRef);
            
            if (discSnap.exists()) {
              const discData = discSnap.data();
              if (discData.materialRef) {
                matSnap = await getDoc(discData.materialRef);
              } else if (discData.deptId) {
                targetDept = discData.deptId;
                const matRef = doc(db, "studyMaterials", targetDept, "Materials", resourceId);
                matSnap = await getDoc(matRef);
              }
            }
          }

          if (matSnap && matSnap.exists()) {
            currentResource = { id: matSnap.id, ...matSnap.data() };
            setResourceData(currentResource); 

            if (auth.currentUser && targetDept) {
              try {
                const userRatingRef = doc(db, "studyMaterials", targetDept, "Materials", resourceId, "ratings", auth.currentUser.uid);
                const userRatingSnap = await getDoc(userRatingRef);
                if (userRatingSnap.exists()) {
                  setRatings((prev) => ({ ...prev, [auth.currentUser.email]: userRatingSnap.data().rating }));
                }
              } catch (err) {
                console.error("Error fetching previous user rating", err);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching full material data:", error);
        }
      }

      if (currentResource) {
        try {
          if (!currentResource.uploaderUid) {
            setUserName(currentResource.displayName || "Unknown User");
          } else {
            const userDocRef = doc(db, "users", currentResource.uploaderUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserDoc(userDocSnap.data());
              setUserName(userDocSnap.data().displayName || "Unknown User");
            } else {
              setUserName(currentResource.displayName || "Unknown User");
            }
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUserName(currentResource.displayName || "Unknown User");
        }

        if (currentResource.courseCode && resourceId) {
          try {
            const currentDept = currentResource.courseCode.slice(0, 3).toUpperCase();
            const quizRef = collection(db, "studyMaterials", currentDept, "Materials", resourceId, "Quizes");
            const q = query(quizRef, orderBy("createdAt"));
            const quizSnap = await getDocs(q);
            setQuizQuestions(quizSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          } catch (error) {
            console.error("Error fetching quiz:", error);
          }
        }
      }

      setLoading(false);
    };

    fetchEverything();
  }, [resourceId]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        const loggedInUserDoc = await getDoc(doc(db, "users", user.uid));
        if (loggedInUserDoc.exists()) {
          setCurrentUserProfile({
            displayName: loggedInUserDoc.data().displayName,
            photoURL: loggedInUserDoc.data().profilePicture,
            role: loggedInUserDoc.data().role || "student" 
          });
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const prefetchReplies = async (commentId) => {
    try {
      const repliesRef = collection(
        materialRef,
        "comments",
        commentId,
        "replies",
      );
      const q = query(repliesRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const replies = snapshot.docs.map((r) => ({
        id: r.id,
        ref: r.ref,
        commentId: commentId,
        ...r.data(),
      }));
      prefetchedRepliesRef.current[commentId] = replies; 
    } catch (err) {
      console.error("Error prefetching replies:", err);
    }
  };

  useEffect(() => {
    if (!dept || !resourceId || !materialRef) return;

    setLoadingComments(true);

    const commentsRef = collection(materialRef, "comments");
    const q = query(
      commentsRef,
      orderBy("createdAt", "desc"),
      limit(COMMENTS_PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ref: docSnap.ref,
        ...docSnap.data(),
      }));
      setComments((prev) => {
        return commentList.map((newComment) => {
          const existing = prev.find((c) => c.id === newComment.id);
          return {
            ...newComment,
            replies: existing?.replies ?? null,
          };
        });
      });
      setLastCommentDoc(snapshot.docs[snapshot.docs.length - 1] || null);

      commentList.forEach((c) => {
        if (c.repliesCount > 0) prefetchReplies(c.id);
      });

      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [dept, resourceId, materialRef?.path]);

  const loadRepliesForComment = (commentId) => {
    const existingComment = comments.find((c) => c.id === commentId);

    if (existingComment?.replies !== null) return;

    const cached = prefetchedRepliesRef.current[commentId];

    if (cached) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: cached } : c)),
      );
    } else {
      prefetchReplies(commentId).then((replies) => {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, replies: replies || [] } : c,
          ),
        );
      });
    }
  };

  const loadMoreComments = async () => {
    if (!lastCommentDoc) return;

    setLoadingMoreComments(true);

    try {
      const commentsRef = collection(materialRef, "comments");
      const q = query(
        commentsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastCommentDoc),
        limit(COMMENTS_PAGE_SIZE),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setAllCommentsLoaded(true);
        return;
      }

      const newComments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ref: docSnap.ref,
        ...docSnap.data(),
        replies: null,
      }));

      setComments((prev) => [...prev, ...newComments]);
      setLastCommentDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < COMMENTS_PAGE_SIZE) {
        setAllCommentsLoaded(true);
      }
      
      newComments.forEach((c) => {
        if (c.repliesCount > 0) prefetchReplies(c.id);
      });
    } catch (err) {
      console.error("Error loading more comments:", err);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return "Just now";
    const date = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isProcessing = useRef(false);

  const sendNotification = async (targetUid, message, type) => {
    try {
      const batch = writeBatch(db);
      const mainNotifRef = doc(collection(db, "notifications"));
      batch.set(mainNotifRef, {
        title: type === "comment" ? "New Comment" : "New Reply",
        message: message,
        createdAt: serverTimestamp(),
        type: type,
        targetId: resourceId 
      });

      const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", targetUid);
      batch.set(userNotifRef, {
        userId: targetUid,
        message: message,
        read: false,
        createdAt: serverTimestamp(),
        type: type,
        targetId: resourceId
      });

      await batch.commit();
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || isProcessing.current) return;
    if (!auth.currentUser) {
      setAlertConfig({ isOpen: true, title: "Login Required", message: "Please login to comment.", type: "warning" });
      return;
    }
    isProcessing.current = true;
    setSubmittingComment(true);

    let tempComment = null;

    if (!replyTo && !editingCommentRef) {
      tempComment = {
        id: `temp-${Date.now()}`,
        userEmail: currentUserEmail,
        userName: currentUserProfile.displayName || "User",
        userProfile: currentUserProfile.photoURL || "",
        userRole: currentUserProfile.role, 
        userId: auth.currentUser.uid, 
        text: commentText,
        createdAt: new Date(), 
        pending: true, 
      };
      setComments((prev) => [tempComment, ...prev]); 
    }

    setCommentText("");
    setReplyTo(null);

    try {
      if (editingCommentRef) {
        await updateDoc(editingCommentRef, { text: commentText });
        setEditingCommentRef(null);
        setCommentText("");
        setReplyTo(null);
        cleanupStates();
        return;
      }
      
      if (!replyTo) {
        const commentsRef = collection(materialRef, "comments");

        const commentDoc = await addDoc(commentsRef, {
          userEmail: currentUserEmail,
          userName: currentUserProfile.displayName || "User",
          userProfile: currentUserProfile.photoURL || "",
          userRole: currentUserProfile.role, 
          userId: auth.currentUser.uid, 
          text: commentText,
          createdAt: serverTimestamp(),
          repliesCount: 0,
        });

        const discussionRef = doc(db, "discussions", materialRef.id);
        const discussionSnap = await getDoc(discussionRef);

        if (!discussionSnap.exists()) {
          await setDoc(discussionRef, {
            materialId: materialRef.id,
            materialRef: materialRef,
            resourceTitle: resourceData?.resourceTitle || "Untitled",
            courseCode: resourceData?.courseCode || "N/A",
            deptId: dept || "Unknown",
            firstCommentId: commentDoc.id,
            firstCommentText: commentText,
            creatorName: currentUserProfile.displayName || "User",
            creatorImage: currentUserProfile.photoURL || "",
            createdAt: serverTimestamp(),
          });
        }

        if (resourceData?.uploaderUid && resourceData.uploaderUid !== auth.currentUser.uid) {
          await sendNotification(
            resourceData.uploaderUid,
            `${currentUserProfile.displayName || "Someone"} commented on your resource: ${resourceData.resourceTitle}`,
            "comment"
          );
        }

        if (tempComment) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === tempComment.id
                ? {
                    ...c,
                    id: commentDoc.id,
                    ref: commentDoc,
                    pending: false,
                    createdAt: serverTimestamp(),
                  }
                : c,
            ),
          );
        }
      } else {
        const repliesRef = collection(
          materialRef,
          "comments",
          replyTo.commentId,
          "replies",
        );
        const replyDoc = await addDoc(repliesRef, {
          userEmail: currentUserEmail,
          userName: currentUserProfile.displayName || "User",
          userProfile: currentUserProfile.photoURL || "",
          userRole: currentUserProfile.role, 
          userId: auth.currentUser.uid, 
          text: commentText,
          createdAt: serverTimestamp(),
          parentReplyId: replyTo.parentReplyId || null,
        });

        const commentRef = doc(materialRef, "comments", replyTo.commentId);
        await updateDoc(commentRef, { repliesCount: increment(1) });

        if (replyTo.replyToUid && replyTo.replyToUid !== auth.currentUser.uid) {
          await sendNotification(
            replyTo.replyToUid,
            `${currentUserProfile.displayName || "Someone"} replied to your comment on: ${resourceData?.resourceTitle}`,
            "reply"
          );
        }

        const newReply = {
          id: replyDoc.id,
          ref: replyDoc,
          commentId: replyTo.commentId, 
          userEmail: currentUserEmail,
          userName: currentUserProfile.displayName || "User",
          userProfile: currentUserProfile.photoURL || "",
          userRole: currentUserProfile.role, 
          userId: auth.currentUser.uid,
          text: commentText,
          createdAt: new Date(),
          parentReplyId: replyTo.parentReplyId || null,
        };

        const currentCached = prefetchedRepliesRef.current[replyTo.commentId] || [];
        prefetchedRepliesRef.current[replyTo.commentId] = [...currentCached, newReply];

        setPrefetchedReplies((prev) => ({
          ...prev,
          [replyTo.commentId]: [...(prev[replyTo.commentId] || []), newReply],
        }));

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyTo.commentId) {
              return { ...c, replies: [...(c.replies || []), newReply] };
            }
            return c;
          }),
        );
      }

      cleanupStates();
    } catch (error) {
      console.error("Error adding comment:", error);
      setAlertConfig({ isOpen: true, title: "Error", message: "Failed to post comment. Please try again.", type: "error" });

      if (tempComment) {
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      }
    } finally {
      isProcessing.current = false;
      setSubmittingComment(false);
    }
  };

  const cleanupStates = () => {
    setCommentText("");
    setReplyTo(null);
    setEditingCommentRef(null);
  };

  const confirmDeleteComment = (item, isReply = false, parentCommentId = null) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Comment",
      message: "Are you sure you want to permanently delete this comment?",
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteDoc(item.ref);

          if (isReply && parentCommentId) {
            const parentRef = doc(materialRef, "comments", parentCommentId);
            await updateDoc(parentRef, { repliesCount: increment(-1) });

            setComments((prev) =>
              prev.map((c) => {
                if (c.id === parentCommentId) {
                  const newReplies = c.replies ? c.replies.filter((r) => r.id !== item.id) : [];
                  return {
                    ...c,
                    replies: newReplies,
                    repliesCount: Math.max(0, (c.repliesCount || 1) - 1),
                  };
                }
                return c;
              })
            );

            if (prefetchedRepliesRef.current[parentCommentId]) {
              prefetchedRepliesRef.current[parentCommentId] = prefetchedRepliesRef.current[parentCommentId].filter((r) => r.id !== item.id);
            }
          }
        } catch (err) {
          console.error("Delete failed", err);
          setAlertConfig({ isOpen: true, title: "Error", message: "Failed to delete comment.", type: "error" });
        }
      }
    });
  };

  const handleReplyClick = (comment) => {
    setReplyTo({
      commentId: comment.commentId || comment.id,
      parentReplyId: comment.commentId ? comment.id : null,
      author: comment.userName,
      replyToUid: comment.userId 
    });

    setCommentText(`@${comment.userName} `);
    const input = document.getElementById("comment-input");
    input?.focus();
  };

  const renderComments = (commentList) =>
    commentList.map((c) => (
      <div key={c.id} className="mt-6">
        <div className="flex gap-3 sm:ml-10">
          {/* --- Clickable Avatar for Profile Modal --- */}
          <div 
            onClick={() => {
              if (c.userId) setSelectedProfileId(c.userId);
            }} 
            className="cursor-pointer shrink-0"
          >
            <img
              src={c.userProfile || "https://ui-avatars.com/api/?name=User"}
              className="w-10 h-10 rounded-full border shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
            />
          </div>
          
          {/* --- Clickable Avatar for Profile Modal --- */}
          <div 
            onClick={() => {
              if (c.userId) setSelectedProfileId(c.userId);
            }} 
            className="cursor-pointer shrink-0"
          >
            <img
              src={c.userProfile || "https://ui-avatars.com/api/?name=User"}
              className="w-10 h-10 rounded-full border shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
            />
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl inline-block max-w-full">
              {/* --- Clickable Name for Profile Modal --- */}
              <h5 
                onClick={() => {
                  if (c.userId) setSelectedProfileId(c.userId);
                }} 
                className="text-[13px] font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors w-fit"
              >
              {/* --- Clickable Name for Profile Modal --- */}
              <h5 
                onClick={() => {
                  if (c.userId) setSelectedProfileId(c.userId);
                }} 
                className="text-[13px] font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors w-fit"
              >
                {c.userName}
                {c.userRole === "teacher" && <MdVerified className="text-blue-500 size-3.5" title="Verified Teacher" />}
              </h5>
              <p className="text-[14px] text-gray-800 mt-1 whitespace-pre-wrap">
                {c.text}
              </p>
            </div>

            <div className="flex gap-3 text-[12px] font-bold text-gray-500 mt-1 ml-2">
              <button
                className="hover:underline"
                onClick={() => handleReplyClick(c)}
              >
                Reply
              </button>
              <span className="font-normal">{formatTime(c.createdAt)}</span>
              {c.userEmail === currentUserEmail && (
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => confirmDeleteComment(c)}
                >
                  Delete
                </button>
              )}
            </div>

            {c.replies === null ? (
              c.repliesCount > 0 && (
                <button
                  className="text-blue-500 hover:underline mt-2 ml-2 text-[12px]"
                  onClick={() => loadRepliesForComment(c.id)}
                >
                  View {c.repliesCount} Replies
                </button>
              )
            ) : c.replies?.length > 0 ? (
              <div className="mt-3 ml-10 space-y-4 border-l-2 border-gray-100 pl-4 sm:pl-10">
                {c.replies.map((r) => (
                  <div key={r.id} className="flex gap-2">
                    {/* --- Clickable Avatar for Replies --- */}
                    <div 
                      onClick={() => {
                        if (r.userId) setSelectedProfileId(r.userId);
                      }} 
                      className="cursor-pointer shrink-0"
                    >
                      <img
                        src={r.userProfile || "https://ui-avatars.com/api/?name=User"}
                        className="w-8 h-8 rounded-full border shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
                      />
                    </div>
                    
                    {/* --- Clickable Avatar for Replies --- */}
                    <div 
                      onClick={() => {
                        if (r.userId) setSelectedProfileId(r.userId);
                      }} 
                      className="cursor-pointer shrink-0"
                    >
                      <img
                        src={r.userProfile || "https://ui-avatars.com/api/?name=User"}
                        className="w-8 h-8 rounded-full border shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="bg-blue-50/50 px-3 py-1.5 rounded-xl inline-block max-w-full border border-blue-100/50">
                        {/* --- Clickable Name for Replies --- */}
                        <h5 
                          onClick={() => {
                            if (r.userId) setSelectedProfileId(r.userId);
                          }} 
                          className="text-[12px] font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors w-fit"
                        >
                        {/* --- Clickable Name for Replies --- */}
                        <h5 
                          onClick={() => {
                            if (r.userId) setSelectedProfileId(r.userId);
                          }} 
                          className="text-[12px] font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors w-fit"
                        >
                          {r.userName}
                          {r.userRole === "teacher" && <MdVerified className="text-blue-500 size-3" title="Verified Teacher" />}
                        </h5>
                        <p className="text-[13px] text-gray-800 whitespace-pre-wrap">
                          {r.text}
                        </p>
                      </div>
                      <div className="flex gap-3 text-[11px] font-bold text-gray-500 mt-0.5 ml-2">
                        <button
                          className="hover:underline"
                          onClick={() => handleReplyClick(r)}
                        >
                          Reply
                        </button>
                        <span className="font-normal">
                          {formatTime(r.createdAt)}
                        </span>
                        {r.userEmail === currentUserEmail && (
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => confirmDeleteComment(r, true, c.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : c.repliesCount > 0 ? (
              <p className="mt-2 ml-2 text-[12px] text-gray-400">
                Loading replies...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    ));

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

  if (!resourceData && !loading) {
    return <Navigate to="/browseresources" />;
  }

  const previewLink = resourceData?.fileLink || resourceData?.fileUrl;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 relative overflow-hidden">
            <p className="text-lg font-semibold text-blue-600">
              {resourceData?.courseCode}
            </p>
            <div className="sm:flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                  {resourceData?.resourceTitle || "Resource Title"}
                  {resourceData?.isApproved && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200">
                      <ShieldCheck size={14} /> Teacher Approved
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 mt-2">
                  {resourceData?.description || "No description available."}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {/* --- Teacher Approval Toggle --- */}
                {currentUserProfile.role === "teacher" && (
                  <button
                    onClick={toggleApproval}
                    className={`p-2.5 rounded-lg transition border ${
                      resourceData?.isApproved
                        ? "bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100"
                        : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                    }`}
                    title={resourceData?.isApproved ? "Revoke Approval" : "Approve Material"}
                  >
                    {resourceData?.isApproved ? <ShieldOff size={20} /> : <ShieldCheck size={20} />}
                  </button>
                )}

                <button
                  onClick={handleReportAction}
                  className="p-2.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-lg transition"
                  title={currentUserProfile.role === "teacher" ? "Delete Material" : "Report Material"}
                >
                  <Flag size={20} />
                </button>

                <button
                  onClick={handleSave}
                  className={`p-2.5 cursor-pointer rounded-lg transition border ${
                    isSaved
                      ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                  title={isSaved ? "Remove from Saved" : "Save Resource"}
                >
                  <Bookmark
                    size={20}
                    className={isSaved ? "fill-current" : ""}
                  />
                </button>
                <button
                  className="flex items-center gap-2 bg-blue-600 text-white sm:px-5 px-5 py-2 cursor-pointer rounded-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => {
                    if (resourceData?.fileId) {
                      const downloadUrl = `https://drive.google.com/uc?export=download&id=${resourceData.fileId}`;
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download =
                        resourceData.resourceTitle +
                        (resourceData.materialType || ".pdf");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      setAlertConfig({ isOpen: true, title: "Not Found", message: "No download link available for this resource.", type: "warning" });
                    }
                  }}
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>

            <div className="mt-8 w-full h-96 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 overflow-hidden">
              {previewLink ? (
                <iframe
                  src={previewLink.replace(
                    /\/view.*|\/edit.*/,
                    "/preview",
                  )}
                  className="w-full h-[150%] transform origin-top border-0"
                  title="Preview"
                />
              ) : (
                <p>Loading Preview...</p>
              )}
            </div>
          </div>

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
                      Quiz: {resourceData?.resourceTitle}
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

          {loadingComments ? (
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar blur-sm animate-pulse">
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">
                  Loading comments...
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl  p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Discussion ({comments.length})
              </h3>

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

              {comments.length > 5 && !allCommentsLoaded && (
                <div className="mt-4 text-center">
                  {!loadingMoreComments && (
                    <button
                      onClick={loadMoreComments}
                      className="text-blue-600 font-semibold text-sm hover:underline"
                    >
                      View all comments
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="hidden sm:block w-10 h-10 rounded-full flex-shrink-0 border border-gray-300 overflow-hidden">
                  <img
                    src={
                      currentUserProfile.photoURL ||
                      `https://ui-avatars.com/api/?name=${currentUserProfile.displayName || "U"}`
                    }
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  {replyTo && (
                    <div className="flex items-center justify-between bg-blue-100/50 px-3 py-2 rounded-lg border border-blue-200 mb-3">
                      <p className="text-xs sm:text-sm text-blue-800">
                        Replying to{" "}
                        <span className="font-bold">{replyTo.author}</span>
                      </p>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <textarea
                    id="comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[80px] h-auto bg-white transition-all"
                    placeholder={
                      replyTo ? `Write your reply...` : "Add a comment..."
                    }
                  />

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={submitComment}
                      disabled={submittingComment || !commentText.trim()}
                      className="relative z-10 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      {submittingComment
                        ? "Posting..."
                        : replyTo
                          ? "Reply"
                          : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
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
                    alt="avatar"
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
              {/* --- Clickable Area for Uploader's Profile Modal --- */}
              <div 
                onClick={() => {
                  if (resourceData?.uploaderUid) setSelectedProfileId(resourceData.uploaderUid);
                }} 
                className="flex items-center gap-4 cursor-pointer group w-fit"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition-all shrink-0">
              {/* --- Clickable Area for Uploader's Profile Modal --- */}
              <div 
                onClick={() => {
                  if (resourceData?.uploaderUid) setSelectedProfileId(resourceData.uploaderUid);
                }} 
                className="flex items-center gap-4 cursor-pointer group w-fit"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition-all shrink-0">
                  {userDoc?.profilePicture ? (
                    <img
                      className="w-full h-full object-cover"
                      src={userDoc.profilePicture}
                      alt={userName}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  <p className="font-bold text-gray-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                    {userName}
                    {userDoc?.role === "teacher" && <MdVerified className="text-blue-500 size-4" title="Verified Teacher" />}
                  </p>

                  <p className="text-xs text-gray-600 uppercase">
                    {userDoc?.program || userDoc?.email || resourceData?.uploaderEmail}
                  </p>
                </div>
              </div>
            </div>
          )}

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

      {isReportModalOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                {currentUserProfile.role === "teacher" 
                  ? <><ShieldCheck className="text-red-500" size={24} /> Delete Material</> 
                  : <><Flag className="text-red-500" size={24} /> Report Material</>}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {currentUserProfile.role === "teacher" 
                  ? "Please provide a reason for deleting this material. The uploader will be notified." 
                  : "Please provide a reason for reporting this material. Admins will review it shortly."}
              </p>
              
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={currentUserProfile.role === "teacher" ? "Reason for deletion..." : "E.g., Inappropriate content, misleading, incorrect course code..."}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none mb-4"
              />
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitReportAction}
                  disabled={reporting || !reportReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-semibold"
                >
                  {reporting ? "Processing..." : (currentUserProfile.role === "teacher" ? "Delete Material" : "Submit Report")}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* --- Public Profile Modal Trigger --- */}
      <PublicProfileModal 
        isOpen={!!selectedProfileId} 
        onClose={() => setSelectedProfileId(null)} 
        userId={selectedProfileId} 
      />

      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
};

export default ResourcePage;