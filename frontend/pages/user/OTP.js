import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import OTP_six_digit from "@/pages/components/otp/OTP_six_digit";
import routes from "@/route/routes";
import axios from "axios";
import API_ENDPOINTS from "@/route/api";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import {Core_Functions} from "@/pages/utils/core_functions";

export default function OTP() {
    const router = useRouter();
    const {  validateAndSubmit } = Core_Functions.useFormValidation();
    const [pinCode, setPinCode] = useState('');

    //region Core Variables

    const [isLoading, setIsLoading] = useState(false);

    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');

    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        otp: -1,
    });

    const [errors, setErrors] = useState({
        otp_error: '',
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

    const handlePinEntered = (pinValue) => {
        console.log("Received OTP:", pinValue); // Debugging log
        setFormData(prevData => ({
            ...prevData,
            otp: pinValue, // Ensure pin is stored as a string
        }));
    };

    const handlePinCodeChange = (newPinCode) => {
        setPinCode(newPinCode);
        handlePinEntered(newPinCode);
    };


    const handleSubmitX = async (e) => {


        try {

            setIsLoading(true);
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT + API_ENDPOINTS.customerOTP,
                {
                    otp: pinCode
                },
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    withCredentials: true,
                });
            const receivedData = response.status;
            if (response.status === 200) {
                setIsLoading(false);
                show_Success("Pin code matched")
                // Core_Functions.navigate(router, routes.new_password);
            } else {
                setIsLoading(false);
                show_Error("Pin code did not matched");
                // Core_Functions.navigate(router, routes.forget_password);
            }
            console.log("Messages = "+response.status);
        } catch (error) {
            setIsLoading(false);
            show_Error("Pin code did not matched");
            console.error("Error Sending Login Request"+error);
            // Core_Functions.navigate(router, routes.forget_password);
        }

    };

    const handleSubmit = async (e) => {
        // e.preventDefault();

        const { isValid, validationErrors } = validateAndSubmit(formData);
        // alert('Pin code = ' + formData.otp);

        if (isValid) {
            setIsLoading(true);
            const response = await Core_Functions.submitForm(API_ENDPOINTS.userOTP, formData, true);
            if (response.data) {
                console.log(response.data);
                setIsLoading(false);
                show_Success("OTP matched")
                Core_Functions.navigate(router,routes.new_password);
            } else {
                setIsLoading(false);
                show_Error("Pin code did not matched");
            }
        } else {
            // Immediately use `validationErrors` instead of relying on state updates
            const errorEntries = Object.entries(validationErrors);

            if (errorEntries.length > 0) {
                // Set the **first** error first
                show_Error(errorEntries[0][1]);


            }

            console.log("Form validation failed:", validationErrors);
        }

    };






    useEffect(() => {
        if (pinCode !== '') {
            handleSubmit(pinCode);
            // alert('Pin code = ' + formData.pin);
        }
    }, [pinCode]);


    return (
        <>
            <div className="relative min-h-screen flex flex-col justify-center bg-black overflow-hidden">
                <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
                    <div className="flex justify-center">

                        <div className="max-w-md mx-auto text-center bg-black px-4 sm:px-8 py-10 rounded-xl shadow">
                            <header className="mb-8">
                                <h1 className="text-2xl font-bold mb-1">Mobile Phone Verification</h1>
                                <p className="text-[15px] text-slate-500">Enter the 6-digit verification code that was sent to your phone number.</p>
                            </header>
                            <OTP_six_digit onPinEntered={handlePinCodeChange} />
                            <div class="text-sm text-slate-500 mt-4">Did not receive code?
                                <a class="font-medium text-indigo-500 hover:text-indigo-600" href="#" onClick={(e) => {e.preventDefault(); Core_Functions.navigate(router, routes.forget_password)}}>
                                    Resend
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="y" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }}>
                    {isLoading && <Spinner_Indicator />}
                    {Show_Success_Alert && <Success_Alert message={SuccessMessage} />}
                    {Show_Error_Alert && <Error_Alert message={ErrorMessage} />}
                </div>

            </div>
        </>
    );
}
