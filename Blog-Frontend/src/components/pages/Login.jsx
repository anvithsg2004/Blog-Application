import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "../AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, () => {
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/profile";
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo, { replace: true });
      });
      toast({
        title: "Login successful",
        description: "You are now logged in.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </Button>
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
