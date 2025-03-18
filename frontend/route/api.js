const API_ENDPOINTS = {
    userAuthIndex: "/api/user/auth/index",
    userAuthSignup: "/api/user/auth/signup",
    userAuthLogin: "/api/user/auth/login",
    userAuthLogout: "/api/user/auth/logout",
    userAuthChangePassword: "/api/user/auth/change_password",
    userIndex: "/api/user/index",
    userService: "/api/user/user_service",
    userSignupDetails: "/api/user/signup/user_details",
    userProfile: "/api/user/profile",
    userProfileCreate: "/api/user/signup/user_details",
    userProfileUpdate: "/api/user/profile/update",
    userForgetPassword: "/api/user/forget_password",
    userOTP: "/api/user/otp",
    getAllHelpRequests: "/api/user/help_requests",
    getSingleHelpRequests: "/api/user/help_request/:id",
    getAllCommentsForSingleHelpRequest: "/api/user/help_request/:id/comments",
    getUserFromComment: "/api/user/help_request/comment/:id/user",
    getUserFromHelpRequest: "/api/user/help_request/:id/user",
    postACommentForAHelpRequest: "/api/user/help_request/comment/post",
};

export default API_ENDPOINTS;
