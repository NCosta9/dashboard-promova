'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Mail, Phone, Calendar, Filter, Search } from 'lucide-react'

interface Lead {
  id: string
  facebook_lead_id: string
  form_name: string
  lead_data: Record<string, string | number | boolean>
  created_time: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  notes?: string
}

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadLeads()
    }
  }, [user])

  const loadLeads = async () => {
    setLoading(true)
    try {
      // Aqui você implementaria a busca de leads da API
      // Por enquanto, vamos usar dados mockados
      const mockLeads: Lead[] = [
        {
          id: '1',
          facebook_lead_id: 'fb_123',
          form_name: 'Formulário de Contato',
          lead_data: {
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999'
          },
          created_time: new Date().toISOString(),
          status: 'new'
        },
        {
          id: '2',
          facebook_lead_id: 'fb_456',
          form_name: 'Interesse em Produto',
          lead_data: {
            name: 'Maria Santos',
            email: 'maria@email.com',
            phone: '(11) 88888-8888'
          },
          created_time: new Date(Date.now() - 86400000).toISOString(),
          status: 'contacted'
        }
      ]
      setLeads(mockLeads)
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'qualified':
        return 'bg-purple-100 text-purple-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo'
      case 'contacted':
        return 'Contatado'
      case 'qualified':
        return 'Qualificado'
      case 'converted':
        return 'Convertido'
      default:
        return status
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter
    const matchesSearch = searchTerm === '' || 
      (typeof lead.lead_data.name === 'string' && lead.lead_data.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof lead.lead_data.email === 'string' && lead.lead_data.email.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gerenciamento de Leads
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visualize e gerencie todos os leads capturados do Facebook
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">Todos os Status</option>
                  <option value="new">Novos</option>
                  <option value="contacted">Contatados</option>
                  <option value="qualified">Qualificados</option>
                  <option value="converted">Convertidos</option>
                </select>
              </div>
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {leads.length}
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
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Novos Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {leads.filter(lead => lead.status === 'new').length}
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
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Em Andamento
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {leads.filter(lead => ['contacted', 'qualified'].includes(lead.status)).length}
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
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Convertidos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {leads.filter(lead => lead.status === 'converted').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Leads
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredLeads.length} lead(s) encontrado(s)
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando leads...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <li key={lead.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {lead.lead_data.name || 'Nome não informado'}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {getStatusText(lead.status)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-4">
                          {lead.lead_data.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-1" />
                              {lead.lead_data.email}
                            </div>
                          )}
                          {lead.lead_data.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-1" />
                              {lead.lead_data.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {new Date(lead.created_time).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-sm text-gray-500">
                            {lead.form_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Ainda não há leads capturados. Conecte sua conta do Facebook para começar a receber leads.'
                : `Nenhum lead com status "${getStatusText(filter)}" foi encontrado.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}