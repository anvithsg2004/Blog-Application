import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiFetch from "../components/utils/api";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiFetch("/api/general-subscribers", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to subscribe");
      }

      toast({
        title: "Subscribed!",
        description: "You’ll receive updates on all new and updated blogs.",
        variant: "success",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Something went wrong. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-black border-t border-[rgba(229,228,226,0.3)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <Link to="/" className="text-3xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 block text-[#E5E4E2] no-underline">
              AIDEN
            </Link>
            <p className="text-[rgba(229,228,226,0.8)] mb-6 max-w-md">
              A monochromatic digital space where brutalist design meets
              futuristic elegance. Express your thoughts with stark contrasts.
            </p>
            <div className="flex gap-4">
              <SocialLink href="https://twitter.com/aidenblog" label="Twitter">
                <Twitter size={20} />
              </SocialLink>
              <SocialLink href="https://linkedin.com/company/aidenblog" label="LinkedIn">
                <Linkedin size={20} />
              </SocialLink>
              <SocialLink href="https://github.com/aidenblog" label="GitHub">
                <Github size={20} />
              </SocialLink>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="md:col-span-2">
            <h3 className="uppercase text-xs leading-tight tracking-[1px] text-[#E5E4E2] mb-4">Pages</h3>
            <ul className="list-none p-0 m-0 grid gap-3">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/register">Register</FooterLink>
              <FooterLink to="/write-blog">Write Blog</FooterLink>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="uppercase text-xs leading-tight tracking-[1px] text-[#E5E4E2] mb-4">Resources</h3>
            <ul className="list-none p-0 m-0 grid gap-3">
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/privacy-policy">Privacy</FooterLink>
              <FooterLink to="/terms">Terms</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="md:col-span-3">
            <h3 className="uppercase text-xs leading-tight tracking-[1px] text-[#E5E4E2] mb-4">Subscribe</h3>
            <p className="text-[rgba(229,228,226,0.8)] mb-4">
              Stay updated with our latest blogs and news.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 py-3 px-3 bg-black border border-[rgba(229,228,226,0.5)] border-r-0 text-white outline-none inset-shadow transition-brutal"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="bg-white text-black py-3 px-4 uppercase text-xs leading-tight tracking-[1px] border-none cursor-pointer transition-brutal hover:bg-[#E5E4E2]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 pt-8 border-t border-[rgba(229,228,226,0.2)] flex flex-col md:flex-row items-center justify-between">
          <p className="text-[rgba(229,228,226,0.6)] text-sm mb-4 md:mb-0">
            © {currentYear} AIDEN Blog. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy-policy"
              className="text-[rgba(229,228,226,0.6)] text-sm no-underline transition-brutal hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-[rgba(229,228,226,0.6)] text-sm no-underline transition-brutal hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Sub-components
const SocialLink = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    className="w-10 h-10 border border-[rgba(229,228,226,0.3)] flex items-center justify-center text-[#E5E4E2] transition-brutal hover:text-white hover:border-[#E5E4E2]"
  >
    {children}
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-[rgba(229,228,226,0.8)] no-underline transition-brutal hover:text-white"
    >
      {children}
    </Link>
  </li>
);

export default Footer;
