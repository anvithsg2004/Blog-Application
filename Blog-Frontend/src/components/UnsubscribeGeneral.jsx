import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiFetch from "../components/utils/api";

const UnsubscribeGeneral = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const { toast } = useToast();
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        if (!email) {
            setStatus("error");
            toast({
                title: "Invalid Request",
                description: "No email provided.",
                variant: "destructive",
            });
            return;
        }

        const unsubscribe = async () => {
            try {
                setStatus("loading");
                const response = await apiFetch(`/api/general-subscribers/unsubscribe?email=${encodeURIComponent(email)}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to unsubscribe");
                }

                setStatus("success");
                toast({
                    title: "Unsubscribed",
                    description: "You have been unsubscribed from AIDEN Blog updates.",
                    variant: "success",
                });
            } catch (error) {
                setStatus("error");
                toast({
                    title: "Unsubscribe Failed",
                    description: error.message || "Something went wrong. Try again later.",
                    variant: "destructive",
                });
            }
        };

        unsubscribe();
    }, [email, toast]);

    return (
        <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
            <div className="text-center text-white">
                {status === "loading" && <p>Unsubscribing...</p>}
                {status === "success" && <p>You have been unsubscribed. Thank you!</p>}
                {status === "error" && <p>Failed to unsubscribe. Please try again.</p>}
            </div>
        </div>
    );
};

export default UnsubscribeGeneral;
