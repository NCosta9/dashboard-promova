// Base class para todas as integrações
export abstract class BaseIntegration {
  abstract name: string
  abstract displayName: string
  abstract description: string
  abstract icon: string
  abstract color: string

  // Métodos que devem ser implementados por cada integração
  abstract connect(userId: string): Promise<string> // Retorna URL de conexão
  abstract disconnect(integrationId: string): Promise<void>
  abstract getMetrics(integrationId: string): Promise<IntegrationMetric[]>
  abstract getLeads?(integrationId: string): Promise<IntegrationLead[]>
  abstract isConnected(userId: string): Promise<boolean>
  abstract getConnectionStatus(userId: string): Promise<IntegrationStatus>
}

export interface IntegrationStatus {
  isConnected: boolean
  connectionId?: string
  accountName?: string
  accountId?: string
  lastSync?: string
  error?: string
}

export interface IntegrationMetric {
  name: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease'
  period: string
  date: string
}

export interface IntegrationLead {
  id: string
  source: string
  name?: string
  email?: string
  phone?: string
  data: Record<string, string | number | boolean>
  createdAt: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
}

// Registry para gerenciar todas as integrações disponíveis
export class IntegrationRegistry {
  private static integrations: Map<string, BaseIntegration> = new Map()

  static register(integration: BaseIntegration) {
    this.integrations.set(integration.name, integration)
  }

  static get(name: string): BaseIntegration | undefined {
    return this.integrations.get(name)
  }

  static getAll(): BaseIntegration[] {
    return Array.from(this.integrations.values())
  }

  static getAvailable(): BaseIntegration[] {
    return this.getAll().filter(integration => integration.name !== 'base')
  }
}