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

export default function Signup() {
    const router = useRouter();
    const {  validateAndSubmit } = Core_Functions.useFormValidation();
    const [currentStep, setCurrentStep] = useState(1);

    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Volunteer',
    });

    const [errors, setErrors] = useState({
        email_error: '',
        password_error: '',
    });

    //endregion Core Variables

    const { login, user } = useAuth();



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

        const { isValid, validationErrors } = validateAndSubmit(formData);

        if (isValid) {
            try {
                setIsLoading(true);
                const response = await Core_Functions.submitForm(API_ENDPOINTS.userAuthSignup, formData);
                if (response.data) {
                    Core_Functions.setCookie('user_id',response.data.user_id);
                    console.log('Set User ID', Core_Functions.getCookie('user_id'));
                    console.log(response.data);
                    setIsLoading(false);
                    show_Success("Signup Successful");
                    Core_Functions.navigate(router,routes.create_user_profile);
                } else {
                    setIsLoading(false);
                    show_Error("Signup failed");
                    Core_Functions.navigate(router,routes.signup);
                }
            } catch (error) {
                setIsLoading(false);
                let errorMessage = "Signup failed";
                if (error.response && error.response.data) {
                    errorMessage = error.response.data.message || "An unexpected error occurred";
                }
                show_Error(errorMessage);
                console.warn("Error Sending Signup Request", error);
                Core_Functions.navigate(router, routes.signup);
            }
        } else {
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
                    {/* Add User Credentials header */}
                    <div className="text-center text-white text-3xl font-semibold mb-6">
                        User Credentials
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
                        <div className="relative">
                            <input type="email" name="email" placeholder="Email" value={formData.email}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.email_error && (
                                <p className="absolute text-red-500 text-sm mt-1">{errors.email_error}</p>
                            )}
                        </div>

                        <div className="relative">
                            <input type="password" name="password" placeholder="Password" value={formData.password}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.password_error && (
                                <p className="absolute text-red-500 text-sm mt-1">{errors.password_error}</p>
                            )}
                        </div>

                        <button type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-300 shadow-md">
                            Next
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
