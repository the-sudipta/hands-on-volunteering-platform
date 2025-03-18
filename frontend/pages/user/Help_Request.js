import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaRegCalendarAlt, FaUser, FaCommentDots, FaTimes } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "@/pages/utils/authcontext";
import { Core_Functions } from "@/pages/utils/core_functions";
import API_ENDPOINTS from "@/route/api";
import Breadcrumbs from "@/pages/components/Breadcrumbs/Breadcrumbs";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import routes from "@/route/routes";


export default function Help_Request() {
    const [posts, setPosts] = useState([]);
    const [user_profile, setUser_profile] = useState(null);
    const [newComments, setNewComments] = useState({});
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState(null);
    const [commentUserProfiles, setCommentUserProfiles] = useState({});

    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    //endregion Core Variables

    //region Core Functions Per Page

    const show_Error = (message) => {
        setShow_Error_Alert(true);
        setErrorMessage(message);

        setTimeout(() => {
            setShow_Error_Alert(false);
            setErrorMessage('');
        }, 3000); // Hide after 3 seconds
    };

    const show_Success = (message) => {
        setShow_Success_Alert(true);
        setSuccessMessage(message);

        setTimeout(() => {
            setShow_Success_Alert(false);
            setSuccessMessage('');
        }, 3000); // Hide after 3 seconds
    };

    //endregion Core Functions Per Page

    const router = useRouter();
    const { user, checkUser } = useAuth();

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = async () => {
        try {
            const response = await Core_Functions.fetchData(API_ENDPOINTS.getAllHelpRequests);
            if (response.data && Array.isArray(response.data)) {
                setPosts(response.data);
                response.data.forEach((post) => getUserDetailsByPost(post.id));
            } else {
                console.error("Invalid response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const getComments = async (postId) => {
        try {
            setIsLoading(true);
            const url = API_ENDPOINTS.getAllCommentsForSingleHelpRequest.replace(":id", postId);
            const response = await Core_Functions.fetchData(url);

            // Check if response contains valid comments
            if (response?.data && Array.isArray(response.data)) {
                setComments((prev) => ({ ...prev, [postId]: response.data }));
                response.data.forEach(comment => getUserDetailsByComment(comment.id));
            } else {
                console.warn(`⚠️ No comments found for post ID ${postId}. Setting empty array.`);
                setComments((prev) => ({ ...prev, [postId]: [] })); // Set empty array instead of null
            }
            setIsLoading(false);
        } catch (error) {
            console.error(`❌ Error fetching comments for post ${postId}:`, error.message);

            // If error is 404, it means no comments exist. Set an empty array instead of crashing.
            if (error.response?.status === 404) {
                console.warn(`⚠️ No comments exist for post ID ${postId} (404). Setting empty array.`);
                setComments((prev) => ({ ...prev, [postId]: [] }));
            } else {
                console.error("Unexpected error:", error);
            }
            setIsLoading(false);
        }
    };


    const getUserDetailsByPost = async (postID) => {
        try {
            setIsLoading(true);
            const url = API_ENDPOINTS.getUserFromHelpRequest.replace(":id", postID);
            const response = await Core_Functions.fetchData(url);
            if (response.data && response.data.name) {
                setUser_profile((prev) => ({ ...prev, [postID]: response.data.name }));
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setIsLoading(false);
        }
    };

    const getUserDetailsByComment = async (commentId) => {
        try {
            setIsLoading(true);
            const url = API_ENDPOINTS.getUserFromComment.replace(":id", commentId);
            const response = await Core_Functions.fetchData(url);
            if (response.data && response.data.name) {
                setCommentUserProfiles((prev) => ({ ...prev, [commentId]: response.data.name }));
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const suffix =
            day % 10 === 1 && day !== 11
                ? "st"
                : day % 10 === 2 && day !== 12
                    ? "nd"
                    : day % 10 === 3 && day !== 13
                        ? "rd"
                        : "th";
        return `${day}${suffix} ${date.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
        })}`;
    };

    const handleCommentSubmit = async (postId) => {
        console.log("Submitting comment for post", postId, newComments[postId]);

        // Check if the comment is empty before sending
        if (!newComments[postId] || newComments[postId].trim() === "") {
            console.error("❌ Comment cannot be empty!");
            return; // Prevent API call if comment is empty
        }

        // Create the correct data format for the API
        const commentData = {
            text: newComments[postId],  // Ensure the API expects this format
            community_help_request_id: postId,
        };

        try {
            const response = await Core_Functions.submitForm(
                API_ENDPOINTS.postACommentForAHelpRequest,
                commentData, // ✅ Send the properly formatted object
                true
            );

            if (response.data) {
                console.log("✅ Comment submitted successfully:", response.data);
                setNewComments(prev => ({ ...prev, [postId]: "" })); // Clear input after submit
                Core_Functions.navigate(router, routes.help_request);
            }

        } catch (error) {
            console.error("❌ Error submitting comment:", error.response?.data || error.message);
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white py-10 px-5 sm:px-10 lg:px-20">
            <h1 className="text-4xl font-bold text-center text-blue-400 mb-10">📰 Help Requests</h1>
            {/* I need a beautiful BreadCramps here */}
            <Breadcrumbs/>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts
                    .slice()
                    .sort((a, b) => b.id - a.id)
                    .map((post) => {
                        const statusColors = {
                            low: "text-green-400 bg-green-900",
                            medium: "text-yellow-400 bg-yellow-900",
                            urgent: "text-red-400 bg-red-900",
                        };

                        return (
                            <motion.div
                                key={post.id}
                                whileHover={{scale: 1.05}}
                                className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 p-5"
                            >
                                <h2 className="text-xl font-semibold text-orange-400">{post.title}</h2>
                                <p className="text-gray-300 text-lg mt-2">{post.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                                    <span
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusColors[post.status] || "text-gray-400 bg-gray-700"}`}
                                    >
                                        <FaRegCalendarAlt/> {post.status || "Unknown"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaUser/> {user_profile?.[post.id] ?? "Not Available"}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-sm text-blue-400 flex items-center gap-1 cursor-pointer"
                                        onClick={() => {
                                            getComments(post.id);
                                            setShowComments(post.id);
                                        }}>
                                        <FaCommentDots/> Comments
                                    </h3>
                                    <input
                                        type="text"
                                        className="mt-2 w-full p-2 bg-gray-700 text-white rounded-lg focus:outline-none"
                                        placeholder="Write a comment..."
                                        value={newComments[post.id] || ""}
                                        onChange={(e) => setNewComments({...newComments, [post.id]: e.target.value})}
                                    />
                                    <button className="mt-2 bg-blue-500 px-4 py-2 rounded-lg text-white"
                                            onClick={() => handleCommentSubmit(post.id)}>
                                        Post Comment
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
            </div>

            {showComments !== null && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-lg flex justify-center items-center z-[100]">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-blue-400 text-lg font-semibold">Comments</h2>
                            <FaTimes className="text-red-500 cursor-pointer" onClick={() => setShowComments(null)}/>
                        </div>
                        <div className="mt-4 max-h-60 overflow-y-auto">
                            {comments[showComments]?.length ? (
                                comments[showComments].map(comment => (
                                    <div key={comment.id} className="bg-gray-700 p-3 rounded-lg mb-2">
                                        <p className="text-gray-200">{comment.text}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex justify-between">
                                            <span>- {commentUserProfiles[comment.id] || "Unknown User"}</span>
                                            <span className="ml-auto">{formatDate(comment.time)}</span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No comments yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div id="y" style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: '999'}}>
                {isLoading && <Spinner_Indicator/>}
                {Show_Success_Alert && <Success_Alert message={SuccessMessage}/>}
                {Show_Error_Alert && <Error_Alert message={ErrorMessage}/>}
            </div>

        </div>
    );
}
