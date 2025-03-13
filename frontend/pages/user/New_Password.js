import React, {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {useAuth} from "@/pages/utils/authcontext";
import API_ENDPOINTS from "@/route/api";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import routes from "@/route/routes";
import {Core_Functions} from "@/pages/utils/core_functions";

export default function New_Password() {
    const router = useRouter();
    const {  validateAndSubmit } = Core_Functions.useFormValidation();

    const [terms_condition_decision, setTerms_condition_decision] = useState(false);



    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = useState({
        password_error: '',
        confirm_password_error: '',
    });

    //endregion Core Variables



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
                // alert('Change Password', formData.password);
                // alert('Confirm Password', formData.confirm_password);
                setIsLoading(true);
                const response = await Core_Functions.submitForm(API_ENDPOINTS.userAuthChangePassword, formData,true);
                if (response.data) {
                    console.log(response.data);
                    setIsLoading(false);
                    show_Success("Password Reset Successful");
                    Core_Functions.navigate(router,routes.login);
                } else {
                    setIsLoading(false);
                    show_Error("Password Reset failed");
                    Core_Functions.navigate(router, routes.forget_password);
                }

            } catch (error) {
                setIsLoading(false);
                let errorMessage = "Login failed";
                if (error.response && error.response.data) {
                    errorMessage = error.response.data.message || "An unexpected error occurred";
                }
                show_Error(errorMessage);
                console.warn("Error Sending Login Request", error);
                Core_Functions.navigate(router, routes.login);
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
            <section className="bg-black dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a href="#" className="flex items-center mb-6 text-5xl font-semibold text-white-900 dark:text-white">
                        {/*<img className="w-12 h-12 mr-2" src="/images/Logo.png" alt="logo" />*/}
                        VolunteerConnects
                    </a>
                    <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                        <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Change Password
                        </h2>
                        <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    id="password"
                                    placeholder="••••••••"
                                    required=""
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                                <label className="label">
                                    {/* <span className="label-text-alt">Bottom Left label</span> */}
                                    <span className="label-text-alt text-red-600">
                                            {errors.password_error}
                                        </span>
                                </label>
                            </div>
                            <div>
                                <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    id="confirm_password"
                                    placeholder="••••••••"
                                    required=""
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                                <label className="label">
                                    {/* <span className="label-text-alt">Bottom Left label</span> */}
                                    <span className="label-text-alt text-red-600">
                                            {errors.confirm_password_error}
                                        </span>
                                </label>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="newsletter"
                                        aria-describedby="newsletter"
                                        type="checkbox"
                                        onChange={(e) => setTerms_condition_decision(e.target.checked)}
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="newsletter" className="font-light text-gray-500 dark:text-gray-300">I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="/pdf/Online_Banking_Management_System___Terms___Conditions.pdf" target="_blank" rel="noopener noreferrer">Terms and Conditions</a></label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                style={{ border: '1px solid white', cursor: 'pointer' }}
                            >
                                Reset password
                            </button>
                        </form>
                    </div>
                    <div id="y" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }}>
                        {isLoading && <Spinner_Indicator />}
                        {Show_Success_Alert && <Success_Alert message={SuccessMessage} />}
                        {Show_Error_Alert && <Error_Alert message={ErrorMessage} />}
                    </div>
                </div>
            </section>
        </>
    );
}
