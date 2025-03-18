"use client"; // Ensure this runs only on the client side

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Core_Functions } from "@/pages/utils/core_functions";
import routes from "@/route/routes";
import { motion } from "framer-motion";
import {FaUserCircle, FaChartPie, FaCogs, FaSignOutAlt, FaBell, FaMoon, FaSun, FaHandsHelping} from "react-icons/fa";
import API_ENDPOINTS from "@/route/api";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import {useAuth} from "@/pages/utils/authcontext";

const Navigation = ({ children }) => {
    const router = useRouter();
    const { user, logout, checkUser } = useAuth();
    const [currentTime, setCurrentTime] = useState("");
    const [currentPage, setCurrentPage] = useState(router.pathname);
    const [darkMode, setDarkMode] = useState(true);






    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        userData: {
            name: "",
            nid: "",
            phone: "",
            gender: "",
            age: "",
            address: "",
        }
    });

    //endregion Core Variables

    //region Core Functions Per Page

    // Function to show success or fail notification

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

    //region Helper function to update nested objects in FormData
    const updateNestedState = (prevData, path, value) => {
        const keys = path.split(".");
        let updatedData = { ...prevData };
        let temp = updatedData;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            temp[key] = { ...temp[key] }; // Preserve existing structure
            temp = temp[key];
        }

        temp[keys[keys.length - 1]] = value; // Set the final property
        return updatedData;
    };
    //endregion Helper function to update nested objects in FormData


    //region Navigation Page Custom Functions


    useEffect(() => {
        // ✅ Ensure the router is ready before checking authentication
        if (!router.isReady) return;

        // ✅ Check if user exists in localStorage
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser && storedUser !== "null" ? JSON.parse(storedUser) : null;

        if (!parsedUser) {
            console.warn("User not authenticated. Redirecting to login.");
            Core_Functions.navigate(router, routes.login);
        }
    }, [router.isReady]); // ✅ Runs only when the router is ready



    //region Update time and check JWT Alive or not in every second
    useEffect(() => {
        setIsLoading(true);
        const updateClock = () => {
            setCurrentTime(new Date().toLocaleTimeString());
        };

        const getUserName = async () => {
            try {

                const response = await Core_Functions.fetchData(API_ENDPOINTS.userProfile);
                console.log('Received Response in Navigation = ', response);
                if (!response) {
                    console.warn("User data is empty. Redirecting to login.");
                    console.warn("Here I should redirect to 500 Error Page.");
                    setIsLoading(false);
                    show_Error('Failed to retrieve user data');
                    Core_Functions.navigate(router, routes.login);
                }else{
                    setFormData((prevData) => updateNestedState(prevData, "userData.name", response.data.name));
                    setIsLoading(false);
                }
            } catch (error) {
                // console.warn("Session expired. Redirecting to login.");
                // show_Error('Session expired');
                // quickly check if user data is available
                await localStorage.removeItem("user_profile");
                if (!checkUser() && localStorage.getItem("user") === null) {
                    console.warn("No authenticated user found. Redirecting to login.");
                    Core_Functions.navigate(router, routes.login);
                }


                // Core_Functions.navigate(router, routes.login);
            }
        };

        updateClock();
        getUserName(); // Fetch user data immediately on mount

        const clockInterval = setInterval(updateClock, 1000);
        const jwtCheckInterval = setInterval(getUserName, 500); // Check every 5s (1s is too frequent)

        return () => {
            clearInterval(clockInterval);
            clearInterval(jwtCheckInterval);
        };
    }, [router]);
    //endregion Update time and check JWT Alive or not in every second


    // Detect first-time visit after login and load Dashboard by default
    useEffect(() => {
        if (router.pathname === routes.root) {
            show_Success('Welcome to VolunteerConnects');
            router.replace(routes.user_dashboard);
        }
    }, [router.pathname]);

    // Listen for router.push() changes and update active page
    useEffect(() => {
        const handleRouteChange = (url) => {
            setCurrentPage(url);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [router.events]);

    const signOut = async () => {
        // alert('Logout Called');
        try {
            setIsLoading(true);
            const response = await Core_Functions.fetchData(API_ENDPOINTS.userAuthLogout);
            console.error('Logout Response = ',response);
            if (response.data.success) {
                await localStorage.setItem("user",null);
                console.log('Local Storage Data = ',localStorage.getItem("user"));
                await localStorage.removeItem("user_profile");
                await logout();
                Core_Functions.navigate(router, routes.login);
                setIsLoading(false);
            } else {
                Core_Functions.navigate(router, routes.dashboard);
            }
        } catch (error) {
            console.error('Error in Logging Out:', error);
        }
        setIsLoading(false);
    }


    //endregion Navigation Page Custom Functions


    return (
        <div
            className={`flex h-screen transition-all duration-500 ${darkMode ? "bg-[rgb(31,41,55)] text-[rgb(181,186,194)]" : "bg-gray-200 text-gray-900"}`}>
            {/* Sidebar with Bounce Animation */}
            <motion.aside
                initial={{x: -100}}
                animate={{x: 0}}
                transition={{type: "spring", stiffness: 100, damping: 8}}
                className={`w-72 p-6 flex flex-col shadow-xl border-r border-gray-700 transition-all duration-500 ${darkMode ? "bg-[rgb(31,41,55)] text-white" : "bg-white text-gray-900"}`}
            >
                <motion.div
                    className="flex flex-col items-center mb-6"
                    initial={{scale: 0.8}}
                    animate={{scale: 1}}
                    transition={{type: "spring", stiffness: 120}}
                >
                    <motion.div whileHover={{scale: 1.1, rotate: 5}}>
                        <FaUserCircle className="text-6xl text-gray-400 mb-2"/>
                    </motion.div>
                    <h2 className="text-xl font-bold">{formData.userData.name}</h2>
                    <span className="text-sm text-gray-400">Volunteer</span>
                </motion.div>
                <nav>
                    <ul className="space-y-4">
                        <li>
                            <motion.button
                                whileHover={{scale: 1.05, x: 5}}
                                onClick={() => Core_Functions.navigate(router, routes.user_dashboard)}
                                className={`flex items-center gap-3 w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out 
                                    ${currentPage === routes.user_dashboard ? "bg-[rgb(55,65,81)] text-white shadow-lg" : "hover:bg-[rgb(55,65,81)] hover:text-white"}`}
                            >
                                <FaChartPie/> Dashboard
                            </motion.button>
                        </li>
                        <li>
                            <motion.button
                                whileHover={{scale: 1.05, x: 5}}
                                onClick={() => Core_Functions.navigate(router, routes.show_my_profile)}
                                className={`flex items-center gap-3 w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out 
                                    ${currentPage === routes.show_my_profile ? "bg-[rgb(55,65,81)] text-white shadow-lg" : "hover:bg-[rgb(55,65,81)] hover:text-white"}`}
                            >
                                <FaCogs/> My Profile
                            </motion.button>
                        </li>
                        <li>
                            <motion.button
                                whileHover={{scale: 1.05, x: 5}}
                                onClick={() => Core_Functions.navigate(router, routes.help_request)}
                                className={`flex items-center gap-3 w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out 
                                    ${currentPage === routes.help_request ? "bg-[rgb(55,65,81)] text-white shadow-lg" : "hover:bg-[rgb(55,65,81)] hover:text-white"}`}
                            >
                                <FaHandsHelping/> Help Request
                            </motion.button>
                        </li>
                    </ul>
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Navigation Bar with Slide Down Animation */}
                <motion.header
                    initial={{y: -100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{type: "spring", stiffness: 80, damping: 10}}
                    className={`shadow-md p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-700 transition-all duration-500 ${darkMode ? "bg-[rgb(55,65,81)]" : "bg-white"}`}
                >
                    <motion.span animate={{rotate: [0, 2, -2, 0]}} transition={{repeat: Infinity, duration: 4}}>
                        Welcome, Volunteer
                    </motion.span>
                    <motion.span animate={{scale: [1, 1.1, 1]}} transition={{repeat: Infinity, duration: 2}}>
                        {currentTime}
                    </motion.span>
                    <div className="flex items-center gap-4">
                        <motion.button whileHover={{scale: 1.1}} className="text-xl">
                            <FaBell className="text-yellow-400"/>
                        </motion.button>
                        <motion.button whileHover={{scale: 1.1}} onClick={() => setDarkMode(!darkMode)}
                                       className="text-xl">
                            {darkMode ? <FaSun className="text-yellow-300"/> : <FaMoon className="text-gray-600"/>}
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300"
                            onClick={(e) => { e.preventDefault(); signOut(); }}
                        >
                            <FaSignOutAlt/> Logout
                        </motion.button>
                    </div>
                </motion.header>

                {/* Page Content with Fly-in Animation */}
                <motion.div
                    key={currentPage}
                    initial={{y: 30, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{type: "spring", damping: 10, stiffness: 100}}
                    className="p-6 overflow-auto h-full"
                >
                    {children}
                </motion.div>
            </main>
            <div id="y" style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: '999'}}>
                {isLoading && <Spinner_Indicator/>}
                {Show_Success_Alert && <Success_Alert message={SuccessMessage}/>}
                {Show_Error_Alert && <Error_Alert message={ErrorMessage}/>}
            </div>
        </div>
    );
};

export default Navigation;
