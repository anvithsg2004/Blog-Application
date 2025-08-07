import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "../AuthContext";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";

const OTPVerification = () => {
    const [otp, setOtp] = useState(Array(4).fill(""));
    const [timer, setTimer] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();
    const email = location.state?.email || "";

    const { verifyOTP, resendOTP, isLoggedIn, authMethod } = useContext(AuthContext);

    // Redirect if already logged in or if OAuth user
    useEffect(() => {
        if (isLoggedIn) {
            if (authMethod === 'oauth') {
                // OAuth users don't need OTP verification
                navigate('/profile', { replace: true });
                return;
            }
            // Basic auth users who are already verified
            navigate('/profile', { replace: true });
            return;
        }

        if (!email) {
            navigate("/register", { replace: true });
            return;
        }
    }, [isLoggedIn, authMethod, email, navigate]);

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
                description: "Your account has been verified. You can now sign in.",
                variant: "success",
            });

            navigate("/login", { replace: true });
        } catch (error) {
            console.error("OTP verification error:", error);

            let errorMessage = "Please try again or request a new code.";
            if (error.message.includes("expired")) {
                errorMessage = "OTP has expired. Please request a new code.";
            } else if (error.message.includes("invalid")) {
                errorMessage = "Invalid OTP code. Please check and try again.";
            }

            toast({
                title: "Verification Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setIsResending(true);

        try {
            await resendOTP(email);
            setTimer(30);
            setOtp(Array(4).fill(""));

            toast({
                title: "OTP Sent",
                description: "A new verification code has been sent to your email.",
                variant: "success",
            });
        } catch (error) {
            console.error("Resend OTP error:", error);
            toast({
                title: "Resend Failed",
                description: error.message || "Failed to resend OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    const handleGoBack = () => {
        navigate('/register', { replace: true });
    };

    if (!email) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-md border-4 border-white p-8 md:p-12 brutal-shadow">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleGoBack}
                        className="p-2 mr-3 bg-transparent border border-[rgba(229,228,226,0.5)] text-white hover:bg-[rgba(229,228,226,0.1)] transition-brutal flex items-center justify-center"
                        disabled={isSubmitting || isResending}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white">
                        VERIFY EMAIL
                    </h1>
                </div>

                <div className="mb-8 text-center">
                    <p className="text-[rgba(229,228,226,0.8)] mb-2">
                        Enter the 4-digit code sent to:
                    </p>
                    <p className="text-white font-semibold break-all">
                        {email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-8">
                    {/* OTP Input Grid */}
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
                                className="w-full aspect-square text-center text-2xl font-bold bg-black border-2 border-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal focus:border-white disabled:opacity-50"
                                aria-label={`Digit ${idx + 1}`}
                                disabled={isSubmitting || isResending}
                            />
                        ))}
                    </div>

                    {/* Timer and Resend */}
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
                                disabled={isSubmitting || isResending}
                                className="flex items-center gap-2 text-white underline transition-brutal hover:text-[#E5E4E2] focus:outline-none bg-transparent border-none cursor-pointer disabled:opacity-50 mx-auto"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4" />
                                        Resend verification code
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-2"
                        disabled={isSubmitting || isResending || otp.join("").length !== 4}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                VERIFYING...
                            </>
                        ) : (
                            "VERIFY EMAIL"
                        )}
                    </Button>
                </form>

                {/* Help Text */}
                <div className="mt-8 p-4 border border-[rgba(229,228,226,0.2)] bg-[rgba(229,228,226,0.05)]">
                    <p className="text-xs text-[rgba(229,228,226,0.7)] text-center">
                        Didn't receive the code? Check your spam folder or click resend after the timer expires.
                        Make sure you entered the correct email address during registration.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;