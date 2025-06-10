"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  lastLoginAt?: string
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me')
      
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setAdmin(data.admin)
        router.push('/dashboard')
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const signup = async (formData: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/auth/login?message=Account created successfully')
        return { success: true }
      } else {
        return { success: false, error: data.error, details: data.details }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setAdmin(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    admin,
    loading,
    login,
    signup,
    logout,
    checkAuth,
  }
}
