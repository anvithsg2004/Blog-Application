"use client"

import { Toaster } from "./components/ui/toaster"
import { Toaster as Sonner } from "./components/ui/sonner"
import { TooltipProvider } from "./components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"

import Home from "./components/pages/Home"
import Login from "./components/pages/Login"
import Register from "./components/pages/Register"
import WriteBlog from "./components/pages/WriteBlog"
import NotFound from "./components/pages/NotFound"
import OTPVerification from "./components/pages/OTPVerification"
import UserProfile from "./components/pages/UserProfile"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AllBlogs from "./components/pages/AllBlogs"
import BlogDetail from "./components/pages/BlogDetail"
import LinkNotAvailable from "./components/pages/LinkNotAvailable"
import EditBlog from "./components/pages/EditBog"
import { AuthProvider } from "./components/AuthContext"
import Unsubscribe from "./components/Unsubscribe"
import UnsubscribeGeneral from "./components/UnsubscribeGeneral"

import "./App.css"

const queryClient = new QueryClient()

const ScrollRestoration = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.history.scrollRestoration = "manual"
    window.scrollTo({
      top: 0,
      behavior: "instant",
    })
  }, [pathname])

  return null
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollRestoration />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/write-blog" element={<WriteBlog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/blogs" element={<AllBlogs />} />
                <Route path="/link-not-available" element={<LinkNotAvailable />} />
                <Route path="/otp-verification" element={<OTPVerification />} />
                <Route path="/edit-blog/:id" element={<EditBlog />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/unsubscribe/general" element={<UnsubscribeGeneral />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
