'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, Users, Eye, MousePointer, RefreshCw } from 'lucide-react'

interface ChartData {
  date: string
  impressions: number
  reach: number
  engagement: number
  clicks: number
}

interface InsightsData {
  page_impressions?: Array<{ date: string; value: number }>
  page_reach?: Array<{ date: string; value: number }>
  page_engaged_users?: Array<{ date: string; value: number }>
  page_clicks?: Array<{ date: string; value: number }>
}

export default function FacebookMetricsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<InsightsData>({})
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [integration, setIntegration] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadInsights()
    }
  }, [user])

  const loadInsights = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/facebook/insights?userId=${user.uid}`)
      const data = await response.json()
      
      if (data.success) {
        setInsights(data.data)
        setIntegration(data.integration)
        processChartData(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (insightsData: InsightsData) => {
    const dates = new Set<string>()
    
    // Coletar todas as datas disponíveis
    Object.values(insightsData).forEach(metricData => {
      if (metricData) {
        metricData.forEach(item => dates.add(item.date))
      }
    })

    // Criar dados do gráfico
    const processedData: ChartData[] = Array.from(dates)
      .sort()
      .map(date => {
        const impressions = insightsData.page_impressions?.find(item => item.date === date)?.value || 0
        const reach = insightsData.page_reach?.find(item => item.date === date)?.value || 0
        const engagement = insightsData.page_engaged_users?.find(item => item.date === date)?.value || 0
        const clicks = insightsData.page_clicks?.find(item => item.date === date)?.value || 0

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          impressions,
          reach,
          engagement,
          clicks
        }
      })

    setChartData(processedData)
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

  const getTotalValue = (data: Array<{ date: string; value: number }> | undefined) => {
    if (!data || data.length === 0) return 0
    return data.reduce((sum, item) => sum + item.value, 0)
  }

  if (!integration) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma integração encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          Conecte sua conta do Facebook primeiro para visualizar as métricas.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Métricas do Facebook
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Página: {integration.page_name}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={loadInsights}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                Atualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Impressões
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(getTotalValue(insights.page_impressions))}
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
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Alcance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(getTotalValue(insights.page_reach))}
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
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Engajamento
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(getTotalValue(insights.page_engaged_users))}
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
                <MousePointer className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Cliques
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(getTotalValue(insights.page_clicks))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Impressions and Reach Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Impressões vs Alcance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Impressões"
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Alcance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Engajamento ao Longo do Tempo
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Engajamento"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Clicks Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Cliques por Dia
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Bar
                      dataKey="clicks"
                      fill="#F59E0B"
                      name="Cliques"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Combined Overview Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Visão Geral das Métricas
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Impressões"
                    />
                    <Line
                      type="monotone"
                      dataKey="reach"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Alcance"
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Engajamento"
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Cliques"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {chartData.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <TrendingUp className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado disponível</h3>
          <p className="mt-1 text-sm text-gray-500">
            Clique em "Atualizar" para buscar as métricas mais recentes do Facebook.
          </p>
        </div>
      )}
    </div>
  )
}