import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-[rgba(229,228,226,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white no-underline"
        >
          NEON ECHO
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 bg-transparent border-none text-white cursor-pointer transition-brutal hover:bg-[rgba(229,228,226,0.1)] md:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-black z-50 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-10">
            <Link
              to="/"
              className="text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              NEON ECHO
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-transparent border-none text-white cursor-pointer transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className="flex flex-col gap-8"
            onClick={() => setIsMenuOpen(false)}
          >
            <NavLinks vertical />
            <div className="pt-8 border-t border-[rgba(229,228,226,0.3)]">
              <AuthButtons vertical />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLinks = ({ vertical = false }) => {
  const links = [
    { name: "HOME", path: "/" },
    { name: "BLOGS", path: "/" },
    { name: "WRITE", path: "/write-blog" },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`${
            vertical 
              ? "text-xl py-2" 
              : "text-xs uppercase tracking-[1px]"
          } text-white no-underline transition-brutal hover:text-[#E5E4E2] ${
            !vertical && "hover:-translate-y-0.5"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
};

const AuthButtons = ({ vertical = false }) => (
  <div className={`flex ${vertical ? "flex-col" : "flex-row"} gap-4`}>
    <Link to="/login">
      <Button 
        variant="outline" 
        className="font-['Space_Grotesk'] font-bold hover:bg-[#E5E4E2] hover:text-black"
      >
        LOGIN
      </Button>
    </Link>
    <Link to="/register">
      <Button 
        className="font-['Space_Grotesk'] font-bold"
      >
        REGISTER
      </Button>
    </Link>
  </div>
);

export default Navbar;