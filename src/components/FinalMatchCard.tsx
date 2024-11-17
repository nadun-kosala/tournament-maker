import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import trophy from '../assets/trophy.gif'

const FinalMatchCard = ({ finalMatch, finalTeam }: any) => {
    const [showCongrats, setShowCongrats] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCongrats(false);
        }, 7000);

        return () => clearTimeout(timer); 
    }, []);

    return (
        <div className="my-5 p-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-lg relative">
            <AnimatePresence>
                {showCongrats && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center z-10 bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.div
                            className="bg-white p-4 rounded-lg shadow-lg text-center sparkle-box relative"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h2 className="text-4xl font-bold text-yellow-500 animate-pulse">
                                🎉 Congratulations! 🎉
                            </h2>
                            <p className="mt-2 text-lg text-gray-700">
                                You are the champion!
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {finalMatch && finalTeam && (
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3">
                        <img src={trophy} alt="Trophy" width={50} height={50} className="mr-3"/>
                        <h2 className="text-2xl font-bold tracking-wider uppercase">
                            Champion!
                        </h2>
                    </div>
                    <p className="text-lg font-semibold">
                        Winner: <span className="underline">{finalTeam.name}</span>
                    </p>
                    <p className="text-sm mt-2">
                        <span className="font-medium">Team Members:</span>
                    </p>
                    <ul className="mt-3 space-y-1 text-sm">
                    {finalTeam.members.map((member: any, index: any) => (
                                    <li key={index}
                                        className="bg-white text-green-700 px-4 py-2 mx-2 rounded-full shadow-sm inline-block font-medium">
                                        {member}
                                    </li>
                                    ))}
                    </ul>
                        <button className="mt-2">Download Tournament Summary</button>
                </div>
            )}
        </div>
    );
};

export default FinalMatchCard;
