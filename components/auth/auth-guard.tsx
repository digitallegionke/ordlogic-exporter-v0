"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Building2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          if (session?.user) {
            setAuthenticated(true)
          }
        } else if (event === 'SIGNED_OUT' || !session?.user) {
          setAuthenticated(false)
          router.push("/sign-in")
        }
      }
    )
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // If there's a refresh token error, clear the session and redirect
      if (error?.message?.includes('refresh_token_not_found') || error?.message?.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut()
        // Clear any corrupted local storage
        localStorage.clear()
        router.push("/sign-in")
        setLoading(false)
        return
      }
      
      if (session?.user) {
        setAuthenticated(true)
      } else {
        router.push("/sign-in")
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push("/sign-in")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-green-600 animate-pulse mb-4" />
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect to sign-in
  }

  return <>{children}</>
}
