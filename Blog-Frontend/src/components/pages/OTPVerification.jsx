import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { verifyOTP, resendOTP } from "../utils/api";

const OTPVerification = () => {
    const [otp, setOtp] = useState(Array(4).fill(""));
    const [timer, setTimer] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();
    const email = location.state?.email || "";

    // Ensure we only ever have 4 refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 4);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((t) => t - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 4) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid 4-digit OTP code.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await verifyOTP(email, code);
            toast({
                title: "Verification Successful",
                description: "Your account has been verified.",
                variant: "success",
            });
            navigate("/login");
        } catch (error) {
            toast({
                title: "Invalid Verification Code",
                description: error.message || "Please try again or request a new code.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOTP(email);
            setTimer(30);
            toast({
                title: "OTP Sent",
                description: "A new verification code has been sent to your email.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Resend Failed",
                description: error.message || "Failed to resend OTP.",
                variant: "destructive",
            });
        }
    };

    if (!email) {
        navigate("/register");
        return null;
    }

    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-md border-4 border-white p-8 md:p-12 brutal-shadow">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 text-white">
                        VERIFY YOUR ACCOUNT
                    </h1>
                    <p className="text-[rgba(229,228,226,0.8)]">
                        Enter the 4-digit code sent to {email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-8">
                    <div className="grid grid-cols-4 gap-3">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className="w-full aspect-square text-center text-2xl font-bold bg-black border-2 border-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal focus:border-white"
                                aria-label={`Digit ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-[rgba(229,228,226,0.8)]">
                                Resend code in{" "}
                                <span className="text-white font-semibold">{timer}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-white underline transition-brutal hover:text-[#E5E4E2] focus:outline-none bg-transparent border-none cursor-pointer"
                            >
                                Resend verification code
                            </button>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 font-['Space_Grotesk'] font-bold"
                        disabled={isSubmitting || otp.join("").length !== 4}
                    >
                        {isSubmitting ? "VERIFYING..." : "VERIFY"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
