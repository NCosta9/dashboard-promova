'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Settings, Facebook, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface Integration {
  id: string
  page_name: string
  page_id: string
  is_active: boolean
  created_at: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadIntegrations()
    }
  }, [user])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      // Aqui você implementaria a busca de integrações da API
      // Por enquanto, vamos usar dados mockados
      const mockIntegrations: Integration[] = []
      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Erro ao carregar integrações:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectFacebook = async () => {
    if (!user) return
    
    try {
      window.location.href = `/api/facebook/connect?userId=${user.uid}`
    } catch (error) {
      console.error('Erro ao conectar Facebook:', error)
    }
  }

  const disconnectIntegration = async (integrationId: string) => {
    // Implementar desconexão da integração
    console.log('Desconectar integração:', integrationId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Configurações
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas integrações e configurações da conta
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Informações da Conta
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID do Usuário
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={user?.uid || ''}
                  disabled
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Integration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Integração Facebook
          </h3>
          
          {integrations.length > 0 ? (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Facebook className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {integration.page_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {integration.page_id}
                        </p>
                        <p className="text-xs text-gray-400">
                          Conectado em: {new Date(integration.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integration.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </span>
                      )}
                      <button
                        onClick={() => disconnectIntegration(integration.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Desconectar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Facebook className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma integração configurada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Conecte sua conta do Facebook para começar a usar o dashboard.
              </p>
              <div className="mt-6">
                <button
                  onClick={connectFacebook}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Facebook className="-ml-1 mr-2 h-4 w-4" />
                  Conectar Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Configuração da API
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook App ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value="2121079158420982"
                  disabled
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Callback URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value="/api/facebook/connect/callback"
                  disabled
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Permissões Configuradas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                'pages_show_list',
                'pages_read_engagement',
                'pages_manage_metadata',
                'ads_read',
                'leads_retrieval'
              ].map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-red-900 mb-4">
            Zona de Perigo
          </h3>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Excluir Conta
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                    e removerá todos os dados de nossos servidores.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-600 border border-transparent rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}