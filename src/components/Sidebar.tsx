'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Facebook,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Métricas Facebook', href: '/dashboard/facebook', icon: BarChart3 },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">CRM Dashboard</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>
    </>
  )
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
}

interface User {
  uid: string
  email: string | null
  displayName: string | null
}

function SidebarContent({ navigation, pathname, user, onLogout }: {
  navigation: NavigationItem[]
  pathname: string
  user: User | null
  onLogout: () => void
}) {
  return (
    <>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Facebook className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">CRM Dashboard</span>
        </div>
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="ml-3 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )
}