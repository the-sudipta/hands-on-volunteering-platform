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

export default function Login() {
    const router = useRouter();
    const {  validateAndSubmit } = Core_Functions.useFormValidation();

    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
                const response = await Core_Functions.submitForm(API_ENDPOINTS.userAuthLogin, formData, true);
                if (response.data) {
                    login(await response.data.access_token, document.cookie);
                    await localStorage.setItem("user", JSON.stringify({ jwt: await response.data.access_token}));
                    console.log(response.data);
                    setIsLoading(false);
                    show_Success("Login Successful");
                    Core_Functions.navigate(router,routes.user_dashboard);
                } else {
                    setIsLoading(false);
                    show_Error("Login failed");
                    Core_Functions.navigate(router,routes.login);
                }
                console.log("JWT = " + response.data.access_token);
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
            <_Title title="VolunteerConnects" />
            <section className="bg-black dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a href="#" className="flex items-center mb-6 text-5xl font-semibold text-white-900 dark:text-white">
                        {/*<img className="w-12 h-12 mr-2" src="/images/Logo.png" alt="logo" />*/}
                        VolunteerConnects
                    </a>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        id="email"
                                        placeholder="name@company.com"
                                        onClick={() => {

                                        }}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                    <label className="label">
                                        {/* <span className="label-text-alt">Bottom Left label</span> */}
                                        <span className="label-text-alt text-[#ff1f40]">
                                            {errors.email_error}
                                        </span>
                                    </label>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        id="password"
                                        placeholder="••••••••"
                                        onClick={() => {

                                        }}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                    <label className="label">
                                         {/*<span className="label-text-alt text-gray-900">Bottom Left label</span>*/}
                                        <span className="label-text-alt text-[#ff1f40]">
                                            {errors.password_error}
                                        </span>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start">

                                    </div>
                                    <a
                                        href="#"
                                        className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                                        onClick={(e) => {e.preventDefault(); Core_Functions.navigate(router, routes.forget_password)}}
                                        onMouseEnter={e => e.target.style.color = '#ff1f40'}
                                        onMouseLeave={e => e.target.style.color = ''}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    style={{ border: '1px solid white', cursor: 'pointer' }}
                                >
                                    Sign in
                                </button>
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Don’t have an account yet?
                                    <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500 ml-2"
                                       onClick={(e) => {e.preventDefault(); Core_Functions.navigate(router, routes.signup)}}
                                       onMouseEnter={e => e.target.style.color = '#4de876'}
                                       onMouseLeave={e => e.target.style.color = ''}
                                    >
                                        Sign up
                                    </a>
                                </p>
                            </form>
                        </div>
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
