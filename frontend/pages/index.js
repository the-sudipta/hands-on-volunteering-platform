'use client';

import { motion } from 'framer-motion';
import React, {useEffect} from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {Core_Functions} from "@/pages/utils/core_functions";
import routes from "@/route/routes";



const _Title = dynamic(() => import('./components/layout/_title'));

export default function Loader() {

    //region Variables

    const router = useRouter();

    //endregion Variables


    //region Functionalities

    Core_Functions.redirectAfterDelay(router,routes.login, 3000);

    //endregion Functionalities


    return (

        <>
            <_Title title="volunteerConnects" />
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <motion.div
                    className="text-4xl font-bold tracking-wide"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 1.2, ease: 'easeInOut'}}
                >
                    <motion.span
                        className="text-indigo-500"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5, duration: 0.8}}
                    >
                        Volunteer
                    </motion.span>
                    <motion.span
                        className="text-white"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 1, duration: 0.8}}
                    >
                        Connects
                    </motion.span>
                </motion.div>
                <motion.div
                    className="absolute bottom-10 flex space-x-2"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 1.5, duration: 1}}
                >
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce delay-300"></div>
                </motion.div>
            </div>


        </>
    );
};
