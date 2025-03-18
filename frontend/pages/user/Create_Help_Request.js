import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaSave } from "react-icons/fa";
import { Core_Functions } from "@/pages/utils/core_functions";
import API_ENDPOINTS from "@/route/api";
import Breadcrumbs from "@/pages/components/Breadcrumbs/Breadcrumbs";
import Spinner_Indicator from "@/pages/components/loading_indicator/Spinner_Indicator";
import Success_Alert from "@/pages/components/toast/Success_Alert";
import Error_Alert from "@/pages/components/toast/Error_Alert";
import routes from "@/route/routes";

export default function Create_Help_Request() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [SuccessMessage, setSuccessMessage] = useState('');
    const [ErrorMessage, setErrorMessage] = useState('');
    const [Show_Success_Alert, setShow_Success_Alert] = useState(false);
    const [Show_Error_Alert, setShow_Error_Alert] = useState(false);

    const [formData, setFormData] = useState({
        id: -1,
        title: '',
        status: '',
        description: '',
        user_id: -1
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await Core_Functions.submitForm(
                API_ENDPOINTS.createNewHelpRequest, // Ensure correct API endpoint
                formData,
                true
            );

            if (response.data) {
                show_Success("Help request submitted successfully!");
                Core_Functions.navigate(router, routes.help_request);
            }
        } catch (error) {
            show_Error(error.response?.data || "Failed to submit help request");
        }
        setIsLoading(false);
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

    return (
        <div className="min-h-screen bg-gray-900 text-white py-10 px-5 sm:px-10 lg:px-20">
            <h1 className="text-4xl font-bold text-center text-blue-400 mb-10">📢 Create Help Request</h1>
            <Breadcrumbs />

            <motion.form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-6">
                    <label className="block text-orange-400 text-lg font-semibold mb-2">Title</label>
                    <textarea
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-orange-400"
                        rows="2"
                        placeholder="Enter your help request title..."
                        required
                    ></textarea>
                </div>

                <div className="mb-6">
                    <label className="block text-blue-400 text-lg font-semibold mb-2">Priority level</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Level</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-pink-400 text-lg font-semibold mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-pink-400"
                        rows="5"
                        placeholder="Describe the help request in detail..."
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:bg-green-600 transition"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner_Indicator /> : <><FaSave /> Submit</>}
                </button>
            </motion.form>

            <div id="alerts" className="fixed bottom-5 right-5 z-50">
                {Show_Success_Alert && <Success_Alert message={SuccessMessage} />}
                {Show_Error_Alert && <Error_Alert message={ErrorMessage} />}
            </div>
        </div>
    );
}
