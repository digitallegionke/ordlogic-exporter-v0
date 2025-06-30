"use client"

import { useState } from "react"
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
import { mockApi, mockExporter } from "@/lib/mockData"

export function UserNav() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await mockApi.signOut()
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
              {getInitials(mockExporter.contact_person)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <p className="text-sm font-medium leading-none">{mockExporter.contact_person}</p>
            <p className="text-xs text-muted-foreground mt-1">{mockExporter.company_name}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{mockExporter.contact_person}</p>
            <p className="text-xs leading-none text-muted-foreground">{mockExporter.email}</p>
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
