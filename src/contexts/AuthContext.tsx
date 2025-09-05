'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Sincronizar usuário com Supabase
        await syncUserWithSupabase(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const syncUserWithSupabase = async (user: User) => {
    // Verificar se as configurações do Supabase estão disponíveis
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Configurações do Supabase não encontradas, pulando sincronização')
      return
    }

    try {
      // Verificar se o usuário tem email
      if (!user.email) {
        console.warn('Usuário sem email, pulando sincronização com Supabase')
        return
      }

      console.log('Sincronizando usuário com Supabase:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      })

      // Testar conexão com Supabase primeiro
      const { error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Erro de conexão com Supabase:', testError)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .upsert({
          firebase_uid: user.uid,
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'firebase_uid'
        })
        .select()

      if (error) {
        console.error('Erro ao sincronizar usuário com Supabase:', {
          error: error,
          message: error.message || 'Mensagem não disponível',
          details: error.details || 'Detalhes não disponíveis',
          hint: error.hint || 'Dica não disponível',
          code: error.code || 'Código não disponível'
        })
      } else {
        console.log('Usuário sincronizado com sucesso:', data)
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário (catch):', {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        stringified: JSON.stringify(error)
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}