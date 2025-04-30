import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md border-4 border-white p-8 md:p-12 brutal-shadow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 text-white">
            SIGN IN
          </h1>
          <p className="text-[rgba(229,228,226,0.8)]">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Email Input */}
          <div className="grid gap-2">
            <label
              htmlFor="email"
              className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none inset-shadow transition-brutal focus:border-white"
            />
          </div>

          {/* Password Input */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#E5E4E2] no-underline transition-brutal hover:text-white"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none inset-shadow transition-brutal focus:border-white"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full py-6 font-['Space_Grotesk'] font-bold"
          >
            SIGN IN
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[rgba(229,228,226,0.3)]"></span>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-black text-[rgba(229,228,226,0.5)] uppercase tracking-[1px] text-xs">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full bg-transparent border border-[rgba(229,228,226,0.5)] text-white py-3 cursor-pointer flex items-center justify-center transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
          >
            <svg
              className="mr-2 h-4 w-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            GOOGLE
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center text-[rgba(229,228,226,0.8)]">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="text-white no-underline transition-brutal hover:text-[#E5E4E2]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;