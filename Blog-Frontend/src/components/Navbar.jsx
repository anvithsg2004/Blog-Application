import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Bell } from "lucide-react";
import { Button } from "./ui/button";
import UserAvatar from "./UserAvatar";
import { AuthContext } from "../components/AuthContext";
import apiFetch from "../components/utils/api";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { isLoggedIn, user, loading, logout } = useContext(AuthContext) || {
    isLoggedIn: false,
    user: null,
    loading: false,
    logout: () => { },
  };

  // Fetch all notifications
  useEffect(() => {
    if (isLoggedIn && !loading) {
      const fetchNotifications = async () => {
        try {
          const response = await apiFetch("/api/notifications", {
            method: "GET",
            headers: {
              Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          } else {
            console.error("Failed to fetch notifications");
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [isLoggedIn, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Log state changes
  useEffect(() => {
    console.log("Navbar: isLoggedIn changed to", isLoggedIn, "user:", user);
  }, [isLoggedIn, user]);

  useEffect(() => {
    console.log("Route changed to", location.pathname);
  }, [location]);

  const handleProfileClick = () => {
    console.log("handleProfileClick: isLoggedIn:", isLoggedIn, "user:", user, "loading:", loading);
    if (loading) {
      console.log("handleProfileClick: Still loading, delaying navigation");
      return;
    }
    if (isLoggedIn && user) {
      console.log("Navigating to /profile");
      navigate("/profile");
    } else {
      console.log("Navigating to /login");
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsMenuOpen(false);
  };

  const handleNotificationItemClick = async (notification) => {
    try {
      // Mark the specific notification as read
      await apiFetch(`/api/notifications/${notification.id}/mark-read`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
        },
      });

      // Delete the notification
      await apiFetch(`/api/notifications/${notification.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
        },
      });

      // Update local state to remove the notification
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      // Navigate to the blog
      navigate(`/blog/${notification.blogId}`);
      setIsNotificationDropdownOpen(false);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-[rgba(229,228,226,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white no-underline"
        >
          AIDEN
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks isLoggedIn={isLoggedIn} />
          {isLoggedIn ? (
            <UserControls
              userImage={user?.photo ? `data:image/jpeg;base64,${user.photo}` : null}
              onProfileClick={handleProfileClick}
              onLogout={handleLogout}
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              isNotificationDropdownOpen={isNotificationDropdownOpen}
              onNotificationItemClick={handleNotificationItemClick}
              dropdownRef={dropdownRef}
            />
          ) : (
            <AuthButtons />
          )}
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
        className={`fixed inset-0 bg-black z-50 transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
      >
        <gatsby-focus-wrapper>
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-10">
              <Link
                to="/"
                className="text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                AIDEN
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-transparent border-none text-white cursor-pointer transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8" onClick={() => setIsMenuOpen(false)}>
              <NavLinks vertical isLoggedIn={isLoggedIn} />
              <div className="pt-8 border-t border-[rgba(229,228,226,0.3)]">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <button
                        onClick={handleNotificationClick}
                        className="flex items-center gap-2 text-white text-xl font-['Space_Grotesk'] font-bold no-underline bg-transparent border-none cursor-pointer transition-brutal hover:text-[#E5E4E2]"
                      >
                        <Bell size={20} />
                        NOTIFICATIONS ({notifications.length})
                      </button>
                      {isNotificationDropdownOpen && (
                        <div className="mt-2 bg-black border border-[rgba(229,228,226,0.3)] p-4 max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-gray-400">No notifications available.</p>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationItemClick(notification)}
                                className={`p-2 cursor-pointer hover:bg-[rgba(229,228,226,0.1)] ${notification.isRead ? "opacity-50" : ""
                                  }`}
                              >
                                <p className="text-white font-['Space_Grotesk']">
                                  <strong>{notification.blogTitle}</strong> by {notification.authorEmail}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        userImage={user?.photo ? `data:image/jpeg;base64,${user.photo}` : null}
                        size="lg"
                        onClick={handleProfileClick}
                      />
                      <div>
                        <button
                          onClick={handleProfileClick}
                          className="text-white text-xl font-['Space_Grotesk'] font-bold no-underline bg-transparent border-none cursor-pointer transition-brutal hover:text-[#E5E4E2]"
                        >
                          MY PROFILE
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-white text-xl font-['Space_Grotesk'] font-bold no-underline bg-transparent border-none cursor-pointer transition-brutal hover:text-[#E5E4E2]"
                    >
                      <LogOut size={20} />
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <AuthButtons vertical />
                )}
              </div>
            </div>
          </div>
        </gatsby-focus-wrapper>
      </div>
    </nav>
  );
};

const NavLinks = ({ vertical = false, isLoggedIn = false }) => {
  const links = [
    { name: "HOME", path: "/" },
    { name: "BLOGS", path: "/blogs" },
    ...(isLoggedIn ? [] : [{ name: "WRITE", path: "/write-blog" }]),
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`${vertical ? "text-xl py-2" : "text-xs uppercase tracking-[1px]"} text-white no-underline transition-brutal hover:text-[#E5E4E2] ${!vertical ? "hover:-translate-y-0.5" : ""
            }`}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
};

const UserControls = ({
  userImage,
  onProfileClick,
  onLogout,
  notifications,
  onNotificationClick,
  isNotificationDropdownOpen,
  onNotificationItemClick,
  dropdownRef,
}) => (
  <div className="flex items-center gap-4">
    <Link
      to="/write-blog"
      className="text-xs uppercase tracking-[1px] text-white no-underline transition-brutal hover:text-[#E5E4E2] hover:-translate-y-0.5"
    >
      WRITE
    </Link>
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onNotificationClick}
        className="relative text-white transition-brutal hover:text-[#E5E4E2] hover:-translate-y-0.5"
      >
        <Bell size={20} />
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>
      {isNotificationDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black border border-[rgba(229,228,226,0.3)] shadow-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-400">No notifications available.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationItemClick(notification)}
                className={`p-4 cursor-pointer hover:bg-[rgba(229,228,226,0.1)] ${notification.isRead ? "opacity-50" : ""
                  }`}
              >
                <p className="text-white font-['Space_Grotesk']">
                  <strong>{notification.blogTitle}</strong> by {notification.authorEmail}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    <UserAvatar userImage={userImage} onClick={onProfileClick} />
    <button
      onClick={onLogout}
      className="text-xs uppercase tracking-[1px] text-white no-underline transition-brutal hover:text-[#E5E4E2] hover:-translate-y-0.5 flex items-center gap-1"
    >
      <LogOut size={16} />
      LOGOUT
    </button>
  </div>
);

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
      <Button className="font-['Space_Grotesk'] font-bold hover:bg-[#E5E4E2] hover:text-black">
        REGISTER
      </Button>
    </Link>
  </div>
);

export default Navbar;
