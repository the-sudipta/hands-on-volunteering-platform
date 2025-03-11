import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import {useAuth} from "@/pages/utils/authcontext";
import routes from "@/route/routes";
import _Title from "@/pages/components/layout/_title";
import API_ENDPOINTS from "@/route/api";
import {Core_Functions} from "@/pages/utils/core_functions";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

export default function Create_Profile() {
    const router = useRouter();
    const {  validateAndSubmit } = Core_Functions.useFormValidation();

    const [currentStep, setCurrentStep] = useState(2);

    //region Core Variables
    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        id: -1,
        name: '',
        age: '',
        gender: '',
        phone: '',
        nid: '',
        address: '',
        user_id: -1
    });

    const [errors, setErrors] = useState({
        name_error: '',
        age_error: '',
        gender_error: '',
        phone_error: '',
        nid_error: '',
        address_error: '',
    });

    //endregion Core Variables





    // Defining Some Extra colors
    const form_color = 'rgb(31, 41, 55)';
    const input_field_color = 'rgb(55, 65, 81)';
    const forms_others_text_color = 'rgb(181, 186, 194)';
    const input_field_placeholder_color = 'rgb(156, 154, 142)';


    //region Core Functions Per Page

    // Function to handle changes in email and password inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleErrors = (field, message) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: message,
        }));
    };


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



    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('User_ID from Cookie = ',Core_Functions.getCookie('user_id'));
        // Get user_id from cookie **before** setting it in state
        const userIdFromCookie = Number(Core_Functions.getCookie('user_id')) || -1;

        console.log('User_ID from Cookie = ', userIdFromCookie);

        // Create a new formData object with user_id included
        const updatedFormData = {
            ...formData,
            user_id: userIdFromCookie
        };


        console.log('Got user_id from Form Data = ',updatedFormData.user_id);

        const { isValid, validationErrors } = await validateAndSubmit(updatedFormData);

        if (isValid) {
            try {
                // Get the user_id from document.cookie
                setIsLoading(true);

                const response = await Core_Functions.submitForm(API_ENDPOINTS.userProfileCreate, updatedFormData);
                // Core_Functions.deleteAllCookies();
                if (response.data) {

                    console.log(response.data);
                    setIsLoading(false);
                    show_Success("Profile created successfully");
                    Core_Functions.navigate(router,routes.login);
                } else {
                    setIsLoading(false);
                    show_Error("Failed to create user profile");
                    Core_Functions.navigate(router,routes.create_user_profile);
                }
            } catch (error) {
                setIsLoading(false);
                let errorMessage = "Failed to create user profile";
                if (error.response && error.response.data) {
                    errorMessage = error.response.data.message || "An unexpected error occurred";
                }
                show_Error(errorMessage);
                console.warn("Error Sending Create-Profile Request", error);
                Core_Functions.navigate(router, routes.create_user_profile);
            }
        } else {
            Core_Functions.navigate(router, routes.create_user_profile);
            // Immediately use `validationErrors` instead of relying on state updates
            const errorEntries = Object.entries(validationErrors);

            if (errorEntries.length > 0) {
                // Set the **first** error first
                handleErrors(errorEntries[0][0] + "_error", errorEntries[0][1]);

                // Then, set the remaining errors one by one (optional)
                errorEntries.slice(1).forEach(([key, message], index) => {
                    setTimeout(() => handleErrors(key + "_error", message), index * 500);
                });
            }

            console.log("Form validation failed:", validationErrors);
        }
    };



    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-lg">
                    {/* Add User Profile header */}
                    <div className="text-center text-white text-3xl font-semibold mb-6">
                        Profile Information
                    </div>

                    {/* Progress steps */}
                    <div className="mb-8 flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentStep === 1 ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                        }`}>1
                        </div>
                        <div className="w-24 h-1 bg-gray-600"></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-400"
                        }`}>2
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col">
                            <input type="text" name="name" placeholder="Name" value={formData.name}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.name_error && <p className="text-red-500 text-xs mt-1">{errors.name_error}</p>}
                        </div>

                        <div className="flex flex-col">
                            <input type="number" name="age" placeholder="Age" value={formData.age}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.age_error && <p className="text-red-500 text-xs mt-1">{errors.age_error}</p>}
                        </div>

                        <div className="flex flex-col">
                            <select name="gender" value={formData.gender} onChange={handleChange}
                                    className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender_error && <p className="text-red-500 text-xs mt-1">{errors.gender_error}</p>}
                        </div>

                        <div className="flex flex-col">
                            <input type="tel" name="phone" placeholder="Phone" value={formData.phone}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.phone_error && <p className="text-red-500 text-xs mt-1">{errors.phone_error}</p>}
                        </div>

                        <div className="flex flex-col">
                            <input type="text" name="nid" placeholder="NID" value={formData.nid} onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.nid_error && <p className="text-red-500 text-xs mt-1">{errors.nid_error}</p>}
                        </div>

                        <div className="flex flex-col">
                            <input type="text" name="address" placeholder="Address" value={formData.address}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.address_error &&
                                <p className="text-red-500 text-xs mt-1">{errors.address_error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-300 shadow-md"
                        >
                            Signup
                        </button>
                    </form>

                </div>

                <div id="y" style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: '999'}}>
                    {isLoading && <Spinner_Indicator/>}
                    {Show_Success_Alert && <Success_Alert message={SuccessMessage}/>}
                    {Show_Error_Alert && <Error_Alert message={ErrorMessage}/>}
                </div>
            </div>
        </>

    );


}
