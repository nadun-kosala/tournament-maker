import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import trophy from '../assets/trophy.gif'
import generatePDF, { Options } from "react-to-pdf";
import { PDF } from "./PDF";

const FinalMatchCard = ({ finalMatch, finalTeam, matches, teams, tournament }: any) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString().replace(/\//g, '_');
    };

    const options: Options = {
        filename: `Tournament_Summary_${formatDate(new Date())}.pdf`,
        page: {
          margin: 20
        }
    };
      
    const [showCongrats, setShowCongrats] = useState(true);
    const getTargetElement = () => document.getElementById("container");

    const downloadPdf = () => generatePDF(getTargetElement, options);

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
                    <p className="text-lg font-semibold mb-5">
                        Winner: <span className="underline">{finalTeam.name}</span>
                    </p>

                    {tournament?.status === 'completed' && (
                        <button
                            onClick={downloadPdf}
                            className="px-6 py-2 mt-6 mb-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Download Tournament Summary
                        </button>
                    )}

                    <div id="container" className="w-full">
                        <div>
                            <PDF 
                                finalMatch={finalMatch} 
                                finalTeam={finalTeam} 
                                matches={matches} 
                                teams={teams}
                                tournament={tournament}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalMatchCard;