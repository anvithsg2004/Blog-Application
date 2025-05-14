import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

const LinkNotAvailable = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-lg border-4 border-white p-12 text-center brutal-shadow">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M13.932 10.645c.108 1.345-1.867 1.345-1.867 1.345M7.267 14.597c-.735.36-1.033 0-1.033 0-.149-.425-.066-1.363-.066-1.363 2.839-3.361 3.771-6.798 3.771-6.798 1.548 0 1.548-1.504 1.548-1.504s1.549 1.504 3.097 0c0 0 1.549 1.504 3.097 0 0 0 1.549 1.504 3.097 0 0 0 0 1.504 1.549 1.504 0 0 .939 3.437 3.772 6.798 0 0 .083.938-.067 1.363 0 0-.298.36-1.032 0 0 0-4.101-2.416-7.742 0 0 0-3.673-2.416-7.345 0 0 0-4.101-2.416-7.743 0 0 0-.299.36-1.033 0 0 0-.082-.938.066-1.363 0 0 .748-3.437 3.772-6.798 0 0 0-1.504 1.548-1.504 0 0 .932 3.437 3.771 6.798" />
                    </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold mb-6">Link Not Available</h1>
                <div className="h-1 w-20 bg-gray-300 mx-auto mb-6"></div>
                <p className="text-xl text-gray-300 mb-8">
                    The author has not provided all their social media links.
                </p>
                <Button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center mx-auto"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    GO BACK
                </Button>
            </div>
        </div>
    );
};

export default LinkNotAvailable;