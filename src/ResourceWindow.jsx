import React, { useEffect, useState } from 'react';
import { Download, Star, User } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { doc, getDoc, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { FaStar } from 'react-icons/fa';


const ResourcePage = () => {
    const { resourceId } = useParams();
  const location = useLocation();
  const resource = location.state?.resource;
  const [userDoc, setUserDoc] = useState(null);
  const [userName, setUserName] = useState("Unknown User");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [hover, setHover] = useState(0);
  const averageRating = resource?.avgRating || 0;
  const ratingCount = resource?.ratingCount || 0;

  const currentUser = auth.currentUser;

  const [ratings, setRatings] = useState(resource?.ratings || {});

    const dept = resource?.courseCode?.slice(0,3);

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
        currentUser.uid
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
        // User updating previous rating
        const oldRating = ratingDoc.data().rating;

        const newAvg =
          (avgRating * ratingCount - oldRating + star) / ratingCount;

        transaction.update(materialRef, {
          avgRating: newAvg
        });

      } else {
        // New rating
        const newAvg =
          (avgRating * ratingCount + star) / (ratingCount + 1);

        transaction.update(materialRef, {
          avgRating: newAvg,
          ratingCount: ratingCount + 1
        });
      }

      transaction.set(ratingRef, {
        rating: star,
      });

    });

    console.log("Rating saved");

  } catch (error) {
    console.error("Rating error:", error);
  }
};


    useEffect(() => {
  if (!resource) {
    alert("No resource data found. Redirecting to browse page.");
    return <Navigate to="/browse" />;
  }

  const fetchUser = async () => {
    try {
      const userDocRef = doc(db, "users", resource.uploaderUid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        console.log("Fetched user doc:", userDocSnap.data());
        setUserDoc(userDocSnap.data());
        setUserName(userDocSnap.data().displayName || "Unknown User");
        setCurrentUserEmail(userDocSnap.data().email || "");
      } else {
        console.log("No such user!");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  fetchUser();
}, [resource, Navigate]);

    

  const comments = [
    { id: 1, name: "Nimal Perera", time: "2 weeks ago", text: "Excellent notes! Really helped me understand the concepts better." },
    { id: 2, name: "Priya Fernando", time: "1 month ago", text: "Very detailed and well-organized. Highly recommend." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content & Comments) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <p className="text-lg font-semibold text-blue-600">{resource.courseCode}</p>
            <div className="sm:flex justify-between items-start mb-4">
                
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{resource?.resourceTitle || "Resource Title"}</h1>
                <p className="text-gray-500 mt-2">
                  {resource?.description || "No description available."}
                </p>
              </div>
              <div className='justify-items-end'>
              <button className="flex items-center gap-2 bg-blue-600 text-white sm:px-5 px-5 py-2  cursor-pointer rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                  if (resource.fileId) {
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${resource.fileId}`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = resource.resourceTitle + (resource.materialType || '.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert("No download link available for this resource.");
                  }
                  setSelectedResource(null);
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
                    <iframe src={resource.fileLink.replace(/\/view.*|\/edit.*/, "/preview")} className="w-full h-full left-0 top-0" title="Preview" />
                 ):(<p>No Preview</p>)}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-green-400 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Comments</h3>
            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm">{comment.name}</span>
                      <span className="text-xs text-gray-600">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <textarea 
                className="w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 min-h-[100px]"
                placeholder="Add your comment..."
              />
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Uploaded By Card */}
          <div className="bg-cyan-100 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Uploaded by</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center shadow-sm overflow-hidden">

                <img className='w-full h-full'
                  src={userDoc?.profilePicture ||<User className="text-gray-400" /> }/>
-
              </div>
              <div>
                <p className="font-bold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-600 uppercase">{userDoc?.program || userDoc?.email}</p>
              </div>
            </div>
          </div>

          {/* Rating Card */}
          <div className="bg-purple-100 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Rating</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-800">4.5</span>
              <div className="mb-2">
                <span>★ {averageRating} Avg</span>
                <div className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md hover:bg-purple-50 transition-colors">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={16}
                              onClick={() => handleRate(star)}
                              onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                              className={`cursor-pointer transition-transform active:scale-125 ${
                         (hover || ratings?.[currentUserEmail] || 0) >= star
                         ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}/>
                          ))}
                        </div>
                <p className="text-[10px] text-gray-500 mt-1 uppercase">Based on {ratingCount} reviews</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ResourcePage;