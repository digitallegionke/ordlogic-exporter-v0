"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { mockApi } from "@/lib/mockData"
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
  }, [])

  const checkAuth = async () => {
    try {
      const { session } = await mockApi.getSession()
      if (session?.user) {
        setAuthenticated(true)
      } else {
        router.push("/exporter/signup")
      }
    } catch (error) {
      router.push("/exporter/signup")
    } finally {
      setLoading(false)
    }
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
    return null // Will redirect to signup
  }

  return <>{children}</>
}
