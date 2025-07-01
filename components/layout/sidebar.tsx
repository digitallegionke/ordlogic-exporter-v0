"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, MapPin, ShoppingCart, User, Settings, Home, Users, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserNav } from "./user-nav"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/exporter/profile", icon: User },
  { name: "Farms", href: "/exporter/farms", icon: MapPin },
  { name: "All Farmers", href: "/exporter/contract-farming/match", icon: Users },
  { name: "Produce Specs", href: "/exporter/specs", icon: FileText },
  { name: "Order", href: "/exporter/order", icon: ShoppingCart },
  { name: "Settings", href: "/exporter/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <Building2 className="h-8 w-8 text-green-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">OrdLogic</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Navigation at the bottom */}
        <div className="border-t border-gray-200 p-4">
          <UserNav />
        </div>
      </div>
      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center h-16 px-4 bg-white border-b border-gray-200">
        {/* TODO: Add mobile menu logic (drawer or sheet) */}
        <button className="text-gray-700 focus:outline-none">
          <span className="sr-only">Open menu</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <span className="ml-2 text-xl font-semibold text-gray-900">OrdLogic</span>
      </div>
    </>
  )
}
