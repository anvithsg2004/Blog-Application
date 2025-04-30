import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: null,
    linkedin: "",
    github: "",
    about: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration attempt:", formData);
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

            <div className="grid gap-2">
              <label
                htmlFor="photo"
                className="uppercase text-xs tracking-[1px] text-[#E5E4E2]"
              >
                Photo
              </label>
              <input
                id="photo"
                className="w-full p-3 bg-black border border-[rgba(229,228,226,0.5)] focus:border-white text-white outline-none transition-brutal file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-medium file:bg-[rgba(229,228,226,0.2)] file:text-white hover:file:bg-[rgba(229,228,226,0.3)]"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
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
          >
            CREATE ACCOUNT
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[rgba(229,228,226,0.3)]"></span>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-black text-[rgba(229,228,226,0.5)] uppercase tracking-[1px] text-xs">
                Or register with
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