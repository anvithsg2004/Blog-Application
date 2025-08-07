"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AuthContext } from "../AuthContext"
import { Github, Chrome, Loader2 } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState({ google: false, github: false })
  const [oauthCallbackProcessed, setOauthCallbackProcessed] = useState(false)
  const [hasShownOAuthToast, setHasShownOAuthToast] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithCredentials, loginWithOAuth, loading: authLoading, isLoggedIn, authMethod } = useContext(AuthContext)

  // Handle OAuth callback parameters first
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const error = urlParams.get("error")
    const success = urlParams.get("success")

    if (error === "oauth_failed") {
      toast({
        title: "Login Failed",
        description: "OAuth authentication failed. Please try again.",
        variant: "destructive",
      })
      navigate("/login", { replace: true })
      setOauthCallbackProcessed(true)
    } else if (success === "oauth") {
      // Mark OAuth callback as processed but don't show toast yet
      window.history.replaceState({}, document.title, "/login")
      setOauthCallbackProcessed(true)
    } else {
      setOauthCallbackProcessed(true)
    }
  }, [location.search, navigate, toast])

  // Handle authentication state changes and redirects
  useEffect(() => {
    // Wait for OAuth callback processing and auth loading to complete
    if (!oauthCallbackProcessed || authLoading) return

    if (isLoggedIn) {
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/profile"
      localStorage.removeItem("redirectAfterLogin")

      // Only show success toast for OAuth users if they just completed OAuth flow and haven't shown it yet
      const wasOAuthCallback =
        location.search.includes("success=oauth") || (authMethod === "oauth" && !hasShownOAuthToast)

      if (authMethod === "oauth" && wasOAuthCallback && !hasShownOAuthToast) {
        setHasShownOAuthToast(true)
        toast({
          title: "Login Successful",
          description: "Welcome! You have been successfully logged in.",
          variant: "default",
        })
      }

      // Small delay to ensure toast is shown before redirect
      setTimeout(() => {
        navigate(redirectTo, { replace: true })
      }, 100)
    }
  }, [
    isLoggedIn,
    authLoading,
    authMethod,
    navigate,
    toast,
    oauthCallbackProcessed,
    location.search,
    hasShownOAuthToast,
  ])

  const handleBasicAuthSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await loginWithCredentials(email, password, () => {
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/profile"
        localStorage.removeItem("redirectAfterLogin")
        navigate(redirectTo, { replace: true })
      })

      // Show success toast only for basic auth
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      })
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "Invalid email or password."
      if (error.message.includes("not verified")) {
        errorMessage = "Please verify your email address before logging in."
      } else if (error.message.includes("not found")) {
        errorMessage = "No account found with this email address."
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      setOauthLoading((prev) => ({ ...prev, [provider]: true }))
      toast({
        title: "Redirecting...",
        description: `Taking you to ${provider === "google" ? "Google" : "GitHub"} for authentication.`,
        variant: "default",
      })

      // Small delay to show the loading state
      setTimeout(() => {
        loginWithOAuth(provider)
      }, 500)
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      toast({
        title: "Authentication Error",
        description: `Failed to initiate ${provider} login. Please try again.`,
        variant: "destructive",
      })
      setOauthLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  // Show loading while processing OAuth callback or auth is loading
  if (authLoading || !oauthCallbackProcessed) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/60 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md border-4 border-white p-8 md:p-12 brutal-shadow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4 text-white">
            SIGN IN
          </h1>
          <p className="text-[rgba(229,228,226,0.8)]">Choose your preferred sign-in method</p>
        </div>

        {/* OAuth Login Buttons */}
        <div className="grid gap-4 mb-8">
          <Button
            onClick={() => handleOAuthLogin("google")}
            disabled={oauthLoading.google || oauthLoading.github}
            variant="outline"
            className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-3 hover:bg-[rgba(229,228,226,0.1)]"
          >
            {oauthLoading.google ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
            {oauthLoading.google ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
          </Button>

          <Button
            onClick={() => handleOAuthLogin("github")}
            disabled={oauthLoading.google || oauthLoading.github}
            variant="outline"
            className="w-full py-6 font-['Space_Grotesk'] font-bold flex items-center justify-center gap-3 hover:bg-[rgba(229,228,226,0.1)]"
          >
            {oauthLoading.github ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
            {oauthLoading.github ? "CONNECTING..." : "CONTINUE WITH GITHUB"}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(229,228,226,0.3)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-[rgba(229,228,226,0.6)] uppercase tracking-[1px]">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Basic Auth Form */}
        <form onSubmit={handleBasicAuthSubmit} className="grid gap-6">
          {/* Email Input */}
          <div className="grid gap-2">
            <label htmlFor="email" className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading || oauthLoading.google || oauthLoading.github}
              className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none inset-shadow transition-brutal focus:border-white disabled:opacity-50"
            />
          </div>

          {/* Password Input */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
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
              disabled={loading || oauthLoading.google || oauthLoading.github}
              className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none inset-shadow transition-brutal focus:border-white disabled:opacity-50"
            />
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
                SIGNING IN...
              </>
            ) : (
              "SIGN IN WITH EMAIL"
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center text-[rgba(229,228,226,0.8)]">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-white no-underline transition-brutal hover:text-[#E5E4E2]">
            Sign up
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 border border-[rgba(229,228,226,0.2)] bg-[rgba(229,228,226,0.05)]">
          <p className="text-xs text-[rgba(229,228,226,0.7)] text-center">
            OAuth authentication is secure and doesn't require email verification. Email authentication requires OTP
            verification for security.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
