import React, { useState, useEffect } from "react";
import { useAuth } from "@/pages/utils/authcontext";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import API_ENDPOINTS from "@/route/api";
import axios from "axios";
import { Core_Functions } from "@/pages/utils/core_functions";
import routes from "@/route/routes";
import { useRouter } from "next/router";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";

export default function Profile() {
    const router = useRouter();
    const { user, checkUser } = useAuth();
    const [editMode, setEditMode] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');
    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        id: -1,
        name: "",
        email: "x@x.com",
        nid: "",
        phone: "",
        gender: "",
        age: "",
        address: "",
        user_id: -1,
        volunteerHistory: []
    });

    const [contributions, setContributions] = useState([
        {
            title: "Beach Cleanup Drive",
            time: "2024-03-01 10:00 AM",
            location: "Miami Beach",
            contributed_time: "3 hours"
        },
        {
            title: "Food Donation Camp",
            time: "2024-02-20 02:00 PM",
            location: "Downtown Shelter",
            contributed_time: "5 hours"
        },
        {
            title: "Tree Plantation Event",
            time: "2024-01-15 09:00 AM",
            location: "City Park",
            contributed_time: "4 hours"
        }
    ]);

    useEffect(() => {
        if (!checkUser()) {
            console.warn("User not authenticated. Redirecting to login.");
            return;
        }
        getUserInfo();
    }, []);

    const getUserInfo = async () => {
        setIsLoading(true);
        try {
            let storedUser = localStorage.getItem("user_profile");
            if (storedUser) {
                setFormData(JSON.parse(storedUser));
            } else {
                const response = await Core_Functions.fetchData(API_ENDPOINTS.userProfile);
                if (response.data) {
                    console.error('Received User Profile Data = ',response.data);
                    setFormData(response.data);
                    localStorage.setItem("user_profile", JSON.stringify(response.data));
                }
            }
        } catch (error) {
            show_Error("Error fetching user data");
        } finally {
            setIsLoading(false);
        }
    };

    const show_Error = (message) => {
        setShow_Error_Alert(true);
        setErrorMessage(message);
        setTimeout(() => {
            setShow_Error_Alert(false);
            setErrorMessage('');
        }, 3000);
    };

    const show_Success = (message) => {
        setShow_Success_Alert(true);
        setSuccessMessage(message);
        setTimeout(() => {
            setShow_Success_Alert(false);
            setSuccessMessage('');
        }, 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            console.error('Update Clicked and data = ', formData);

            // Ensure id is included in the payload
            const payload = { ...formData };
            if (!payload.id || payload.id === -1) {
                payload.id = user?.id;
            }
            payload.id = String(payload.id); // Ensure id is a string

            console.log("Final Payload before request:", payload);


            const response = await Core_Functions.submitForm(API_ENDPOINTS.userProfileUpdate, payload, true);

            if (response.data) {
                show_Success("Profile updated successfully");
                localStorage.setItem("user_profile", JSON.stringify(response.data));
                setEditMode(false);
            } else {
                show_Error("Failed to update user profile");
            }
        } catch (error) {
            console.error("Error Response: ", error.response);
            show_Error(error.response?.data?.message?.[0] || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <div className="p-6 max-w-4xl mx-auto transition-all duration-500">
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="p-6 rounded-xl shadow-lg transition-all duration-500 bg-white dark:bg-[rgb(31,41,55)]">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personal Details</h2>
                    {Object.keys(formData).slice(1, 7).map((key) => (
                        <div key={key} className="mb-3">
                            <label
                                className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">
                                {key}
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2
                            focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            ) : (
                                <p className="bg-gray-50 text-gray-800 px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white">
                                    {formData[key]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Volunteering Career */}
                <div className="p-6 rounded-xl shadow-lg transition-all duration-500 bg-gray-900 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4 text-white">Volunteering Career</h2>
                    <ul className="space-y-2">
                        {Array.isArray(contributions) && contributions.length > 0 ? (
                            contributions.map((contribution, index) => (
                                <li key={index} className="bg-gray-700 px-3 py-2 rounded-lg text-white">
                                    <strong className="text-blue-400">{contribution.title}</strong> -
                                    <span
                                        className="text-gray-300"> {contribution.time} at {contribution.location} </span>
                                    <span className="text-green-400">({contribution.contributed_time})</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400">No contributions found.</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
                {editMode ? (
                    <>
                        <button onClick={handleSave}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md transition-all">
                            <FaSave/> Save
                        </button>
                        <button onClick={() => setEditMode(false)}
                                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg shadow-md transition-all">
                            <FaTimes/> Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition-all">
                        <FaEdit/> Edit Profile
                    </button>
                )}
            </div>
            <div id="y" style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: '999'}}>
                {isLoading && <Spinner_Indicator/>}
                {Show_Success_Alert && <Success_Alert message={SuccessMessage}/>}
                {Show_Error_Alert && <Error_Alert message={ErrorMessage}/>}
            </div>
        </div>

    );
}
