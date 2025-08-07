import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "../AuthContext";
import { Github, Chrome, Loader2, Info } from "lucide-react";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, loginWithOAuth } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    photo: null,
    linkedin: "",
    github: "",
    twitter: "",
    about: "",
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, github: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        photo: file,
      });

      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          setPreviewUrl(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleOAuthSignup = async (provider) => {
    try {
      setOauthLoading(prev => ({ ...prev, [provider]: true }));

      toast({
        title: "Redirecting...",
        description: `Taking you to ${provider === 'google' ? 'Google' : 'GitHub'} to create your account.`,
        variant: "default",
      });

      // Small delay to show the loading state
      setTimeout(() => {
        loginWithOAuth(provider);
      }, 500);

    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      toast({
        title: "Authentication Error",
        description: `Failed to initiate ${provider} signup. Please try again.`,
        variant: "destructive",
      });
      setOauthLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data for multipart request
      const data = new FormData();
      // Stringify the user data and append it as the "user" part
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        about: formData.about,
      };
      data.append("user", JSON.stringify(userData));
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const response = await register(data);

      toast({
        title: "Registration Successful",
        description: "Please verify your email with the OTP sent.",
        variant: "success",
      });

      // Navigate to OTP verification page with email
      navigate("/verify-otp", { state: { email: response.email } });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred while registering.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-black py-16 px-6">
      <div className="w-full max-w-2xl border-4 border-white p-8 md:p-12 brutal-shadow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-4">
            CREATE ACCOUNT
          </h1>
          <p className="text-[rgba(229,228,226,0.8)]">
            Join our community of writers and share your knowledge
          </p>
        </div>

        {/* OAuth Signup Buttons */}
        <div className="grid gap-4 mb-8">
          <Button
            onClick={() => handleOAuthSignup('google')}
            disabled={oauthLoading.google || oauthLoading.github || loading}
            variant="outline"
            className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-3 hover:bg-[rgba(229,228,226,0.1)]"
          >
            {oauthLoading.google ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            {oauthLoading.google ? "CONNECTING..." : "SIGN UP WITH GOOGLE"}
          </Button>

          <Button
            onClick={() => handleOAuthSignup('github')}
            disabled={oauthLoading.google || oauthLoading.github || loading}
            variant="outline"
            className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-3 hover:bg-[rgba(229,228,226,0.1)]"
          >
            {oauthLoading.github ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            {oauthLoading.github ? "CONNECTING..." : "SIGN UP WITH GITHUB"}
          </Button>
        </div>

        {/* OAuth Benefits Notice */}
        <div className="mb-8 p-4 border border-[rgba(229,228,226,0.2)] bg-[rgba(229,228,226,0.05)] flex items-start gap-3">
          <Info className="h-5 w-5 text-[rgba(229,228,226,0.7)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[rgba(229,228,226,0.8)] font-semibold mb-1">
              Quick & Secure OAuth Signup
            </p>
            <p className="text-xs text-[rgba(229,228,226,0.7)]">
              OAuth signup is instant - no email verification required. Your account will be ready immediately.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(229,228,226,0.3)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-[rgba(229,228,226,0.6)] uppercase tracking-[1px]">
              Or create account with email
            </span>
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Full Name
              </label>
              <input
                id="name"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* Password Input */}
            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Password
              </label>
              <input
                id="password"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* Phone Input */}
            <div className="grid gap-2">
              <label
                htmlFor="phone"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Phone Number
              </label>
              <input
                id="phone"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Do not add +91"
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* Photo Input */}
            <div className="grid gap-2">
              <label
                htmlFor="photo"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Photo
              </label>
              <div className="relative">
                <input
                  id="photo"
                  className="w-full p-3 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none transition-brutal file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-medium file:bg-[rgba(229,228,226,0.2)] file:text-white hover:file:bg-[rgba(229,228,226,0.3)] disabled:opacity-50"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading || oauthLoading.google || oauthLoading.github}
                />
                {previewUrl && (
                  <div className="mt-2 w-16 h-16 overflow-hidden border border-[rgba(229,228,226,0.3)]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn Input */}
            <div className="grid gap-2">
              <label
                htmlFor="linkedin"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                LinkedIn Profile
              </label>
              <input
                id="linkedin"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* GitHub Input */}
            <div className="grid gap-2">
              <label
                htmlFor="github"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                GitHub Profile
              </label>
              <input
                id="github"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="github"
                type="url"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* Twitter/X Input */}
            <div className="grid gap-2 md:col-span-2">
              <label
                htmlFor="twitter"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                X (Twitter) Profile
              </label>
              <input
                id="twitter"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal disabled:opacity-50"
                name="twitter"
                type="url"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>

            {/* About Textarea */}
            <div className="grid gap-2 md:col-span-2">
              <label
                htmlFor="about"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                About Me
              </label>
              <textarea
                id="about"
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal h-36 resize-vertical disabled:opacity-50"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                disabled={loading || oauthLoading.google || oauthLoading.github}
              />
            </div>
          </div>

          {/* Email Registration Notice */}
          <div className="p-4 border border-[rgba(229,228,226,0.2)] bg-[rgba(229,228,226,0.05)] flex items-start gap-3">
            <Info className="h-5 w-5 text-[rgba(229,228,226,0.7)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[rgba(229,228,226,0.8)] font-semibold mb-1">
                Email Verification Required
              </p>
              <p className="text-xs text-[rgba(229,228,226,0.7)]">
                You'll receive an OTP code to verify your email address before you can access your account.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-2"
            disabled={loading || oauthLoading.google || oauthLoading.github}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                CREATING ACCOUNT...
              </>
            ) : (
              "CREATE ACCOUNT WITH EMAIL"
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center text-[rgba(229,228,226,0.8)]">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-white no-underline transition-brutal hover:text-[#E5E4E2]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;