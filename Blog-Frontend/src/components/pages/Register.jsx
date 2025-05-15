import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "../utils/api";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

      const response = await registerUser(data);

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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
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
                  className="w-full p-3 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none transition-brutal file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-medium file:bg-[rgba(229,228,226,0.2)] file:text-white hover:file:bg-[rgba(229,228,226,0.3)]"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="github"
                type="url"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal"
                name="twitter"
                type="url"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
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
                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none inset-shadow transition-brutal h-36 resize-vertical"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 font-['Space_Grotesk'] font-bold"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
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
