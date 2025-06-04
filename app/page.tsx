"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Calendar, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthResponse {
  success: boolean
  token: string
  user: any
}

declare global {
  interface Window {
    google: any
  }
}

const API_BASE_URL = "http://localhost:8000/api/v1"
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id"

export default function Home() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()

    // Load Google One Tap
    loadGoogleOneTap()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          localStorage.removeItem("auth_token")
        }
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }

  const loadGoogleOneTap = () => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initializeGoogleOneTap
      document.head.appendChild(script)
    }
  }

  const initializeGoogleOneTap = () => {
    if (window.google && !user) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      })

      // Render the One Tap prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("One Tap not displayed:", notification.getNotDisplayedReason())
        }
      })

      // Render the Sign In button
      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with",
      })
    }
  }

  const handleGoogleResponse = async (response: any) => {
    setIsSigningIn(true)

    try {
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })

      const data: AuthResponse = await result.json()

      if (data.success && data.token) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${data.user.name}`,
        })
      } else {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Sign in failed:", error)
      toast({
        title: "Sign In Failed",
        description: "There was an error signing you in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      localStorage.removeItem("auth_token")
      setUser(null)

      // Sign out from Google
      if (window.google) {
        window.google.accounts.id.disableAutoSelect()
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })

      // Reload to reinitialize Google One Tap
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Google One Tap Demo</h1>
          <p className="text-gray-600">Testing FastAPI backend with Google OAuth and MongoDB</p>
        </div>

        {!user ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in with your Google account to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div id="google-signin-button"></div>
              </div>

              {isSigningIn && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Signing you in...</span>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">By signing in, you agree to our terms of service</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <LogOut className="h-5 w-5" />
                    <span>Profile</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.picture || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        ID: {user.id}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend Status</CardTitle>
                <CardDescription>Connection status with your FastAPI backend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Connection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">MongoDB</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Google OAuth</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
