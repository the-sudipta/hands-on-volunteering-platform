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

export default function Profile() {

    const [user, setUser] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT + API_ENDPOINTS.customerProfile,
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    withCredentials: true,
                }
            );
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
            console.log("User Name = ", response.data.name);
        } catch (error) {
            console.error("Error fetching Data : ", error);
        }
    };




    return (
        <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p>Welcome to your profile page!</p>
        </div>
    );


}
