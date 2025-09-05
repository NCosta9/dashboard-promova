'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Facebook, TrendingUp, Users, Eye, MousePointer, BarChart3, Settings } from 'lucide-react'

interface FacebookIntegration {
  page_name: string
  page_id: string
  is_active: boolean
}

interface InsightsData {
  page_impressions?: Array<{ date: string; value: number }>
  page_reach?: Array<{ date: string; value: number }>
  page_engaged_users?: Array<{ date: string; value: number }>
  page_clicks?: Array<{ date: string; value: number }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [integration, setIntegration] = useState<FacebookIntegration | null>(null)
  const [insights, setInsights] = useState<InsightsData>({})
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (user) {
      checkFacebookIntegration()
    }
  }, [user])

  const checkFacebookIntegration = async () => {
    // Aqui você implementaria a verificação se já existe uma integração
    // Por enquanto, vamos simular que não há integração
    setIntegration(null)
  }

  const connectFacebook = async () => {
    if (!user) return
    
    setConnecting(true)
    try {
      // Redirecionar para a API de conexão do Facebook
      window.location.href = `/api/facebook/connect?userId=${user.uid}`
    } catch (error) {
      console.error('Erro ao conectar Facebook:', error)
      setConnecting(false)
    }
  }

  const loadInsights = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/facebook/insights?userId=${user.uid}`)
      const data = await response.json()
      
      if (data.success) {
        setInsights(data.data)
        setIntegration(data.integration)
      }
    } catch (error) {
      console.error('Erro ao carregar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLatestValue = (data: Array<{ date: string; value: number }> | undefined) => {
    if (!data || data.length === 0) return 0
    return data[data.length - 1]?.value || 0
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo ao seu painel de controle de métricas do Facebook
          </p>
        </div>
      </div>

      {/* Facebook Connection Status */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Integração Facebook
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                {integration ? (
                  <p>
                    Conectado à página: <span className="font-medium">{integration.page_name}</span>
                  </p>
                ) : (
                  <p>
                    Conecte sua conta do Facebook para começar a visualizar métricas e gerenciar leads.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              {integration ? (
                <button
                  onClick={loadInsights}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Carregando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="-ml-1 mr-2 h-4 w-4" />
                      Atualizar Métricas
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={connectFacebook}
                  disabled={connecting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Facebook className="-ml-1 mr-2 h-4 w-4" />
                      Conectar Facebook
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {integration && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Impressões
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(getLatestValue(insights.page_impressions))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Alcance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(getLatestValue(insights.page_reach))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Engajamento
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(getLatestValue(insights.page_engaged_users))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MousePointer className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Cliques
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(getLatestValue(insights.page_clicks))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <a href="/dashboard/facebook" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Ver Métricas Detalhadas
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Gráficos e análises completas
                  </p>
                </a>
              </div>
            </div>

            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <a href="/dashboard/leads" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Gerenciar Leads
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Visualizar e organizar leads
                  </p>
                </a>
              </div>
            </div>

            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <a href="/dashboard/settings" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Configurações
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Gerenciar integrações
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}