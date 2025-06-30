"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Building2 } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"

export function UserNav() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<{
    contact_person: string;
    company_name: string;
    email: string;
  } | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setProfileLoading(false)
        return
      }
      const { data: exporter, error: exporterError } = await supabase
        .from('exporters')
        .select('contact_person, company_name, email')
        .eq('auth_user_id', user.id)
        .single()
      if (exporterError || !exporter) {
        setProfileLoading(false)
        return
      }
      setProfile(exporter)
      setProfileLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success("Signed out successfully")
      router.push("/exporter/signup")
    } catch (error: any) {
      toast.error("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-3">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-green-100 text-green-700">
              {profileLoading ? "--" : getInitials(profile?.contact_person || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <p className="text-sm font-medium leading-none">
              {profileLoading ? <span className="text-gray-400">Loading...</span> : (profile?.contact_person || "User")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {profileLoading ? <span className="text-gray-300">Loading...</span> : (profile?.company_name || "Company")}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.contact_person || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email || "-"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/exporter/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/exporter/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/exporter/profile")}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Company Info</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
