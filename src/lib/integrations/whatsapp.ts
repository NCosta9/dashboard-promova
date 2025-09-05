import { BaseIntegration, IntegrationStatus, IntegrationMetric, IntegrationLead } from './base'

// Exemplo de integração futura - WhatsApp Business API
export class WhatsAppIntegration extends BaseIntegration {
  name = 'whatsapp'
  displayName = 'WhatsApp Business'
  description = 'Integração com WhatsApp Business API para mensagens e leads'
  icon = 'MessageCircle'
  color = '#25D366'

  async connect(userId: string): Promise<string> {
    // Implementação futura da conexão com WhatsApp Business API
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/whatsapp/connect/callback`
    
    // URL de autorização do WhatsApp Business (exemplo)
    const whatsappAuthUrl = new URL('https://business.whatsapp.com/oauth/authorize')
    whatsappAuthUrl.searchParams.set('client_id', process.env.WHATSAPP_CLIENT_ID || '')
    whatsappAuthUrl.searchParams.set('redirect_uri', redirectUri)
    whatsappAuthUrl.searchParams.set('scope', 'whatsapp_business_messaging')
    whatsappAuthUrl.searchParams.set('response_type', 'code')
    whatsappAuthUrl.searchParams.set('state', userId)

    return whatsappAuthUrl.toString()
  }

  async disconnect(integrationId: string): Promise<void> {
    // Implementação futura da desconexão
    console.log('Desconectando WhatsApp:', integrationId)
    throw new Error('Integração WhatsApp ainda não implementada')
  }

  async getMetrics(integrationId: string): Promise<IntegrationMetric[]> {
    // Métricas do WhatsApp Business: mensagens enviadas, entregues, lidas, etc.
    return [
      {
        name: 'Mensagens Enviadas',
        value: 0,
        change: 0,
        changeType: 'increase',
        period: 'day',
        date: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Mensagens Entregues',
        value: 0,
        change: 0,
        changeType: 'increase',
        period: 'day',
        date: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Mensagens Lidas',
        value: 0,
        change: 0,
        changeType: 'increase',
        period: 'day',
        date: new Date().toISOString().split('T')[0]
      }
    ]
  }

  async getLeads(integrationId: string): Promise<IntegrationLead[]> {
    // Leads capturados via WhatsApp
    return []
  }

  async isConnected(userId: string): Promise<boolean> {
    // Verificar se há integração ativa do WhatsApp
    return false
  }

  async getConnectionStatus(userId: string): Promise<IntegrationStatus> {
    return {
      isConnected: false,
      error: 'Integração WhatsApp ainda não implementada'
    }
  }
}