"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { AuthGuard } from "../auth/auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
