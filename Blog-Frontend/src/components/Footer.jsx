import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[rgba(229,228,226,0.3)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <Link to="/" className="text-3xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 block text-[#E5E4E2] no-underline">
              NEON ECHO
            </Link>
            <p className="text-[rgba(229,228,226,0.8)] mb-6 max-w-md">
              A monochromatic digital space where brutalist design meets
              futuristic elegance. Express your thoughts with stark contrasts.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
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
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 py-3 px-3 bg-black border border-[rgba(229,228,226,0.5)] border-r-0 text-white outline-none inset-shadow transition-brutal"
              />
              <button
                type="submit"
                className="bg-white text-black py-3 px-4 uppercase text-xs leading-tight tracking-[1px] border-none cursor-pointer transition-brutal hover:bg-[#E5E4E2]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 pt-8 border-t border-[rgba(229,228,226,0.2)] flex flex-col md:flex-row items-center justify-between">
          <p className="text-[rgba(229,228,226,0.6)] text-sm mb-4 md:mb-0">
            © {currentYear} Neon Echo Blog. All rights reserved.
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