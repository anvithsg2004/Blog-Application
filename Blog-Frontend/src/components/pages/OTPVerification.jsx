import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const OTPVerification = () => {
    const [otp, setOtp] = useState(Array(4).fill(""));
    const [timer, setTimer] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { toast } = useToast();

    // ensure we only ever have 4 refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 4);
    }, []);

    // countdown timer
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

    const handleSubmit = (e) => {
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
        setTimeout(() => {
            if (code === "1234") {
                toast({
                    title: "Verification successful",
                    description: "Your account has been verified.",
                });
                navigate("/login");
            } else {
                toast({
                    title: "Invalid verification code",
                    description: "Please try again or request a new code.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
            }
        }, 1500);
    };

    const handleResendOtp = () => {
        setTimer(30);
        toast({
            title: "OTP sent",
            description: "A new verification code has been sent to your email.",
        });
    };

    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-md border-4 border-white p-8 md:p-12 brutal-shadow">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 text-white">
                        VERIFY YOUR ACCOUNT
                    </h1>
                    <p className="text-[rgba(229,228,226,0.8)]">
                        Enter the 4-digit code sent to your email
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

                    <p className="text-xs text-[rgba(229,228,226,0.6)] text-center mt-4">
                        <span className="block mb-1">For testing use:</span>
                        <span className="inline-block bg-[rgba(229,228,226,0.1)] px-2 py-1 font-mono">
                            1234
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
