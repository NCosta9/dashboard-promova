import { IntegrationRegistry } from './base'
import { FacebookIntegration } from './facebook'
import { WhatsAppIntegration } from './whatsapp'

// Registrar todas as integrações disponíveis
const facebookIntegration = new FacebookIntegration()
const whatsappIntegration = new WhatsAppIntegration()

IntegrationRegistry.register(facebookIntegration)
IntegrationRegistry.register(whatsappIntegration)

// Exportar integrações individuais
export { FacebookIntegration, WhatsAppIntegration }

// Exportar registry e classes base
export { IntegrationRegistry, BaseIntegration } from './base'
export type { IntegrationStatus, IntegrationMetric, IntegrationLead } from './base'

// Função helper para obter integração por nome
export function getIntegration(name: string) {
  return IntegrationRegistry.get(name)
}

// Função helper para obter todas as integrações disponíveis
export function getAvailableIntegrations() {
  return IntegrationRegistry.getAvailable()
}

// Função helper para verificar se uma integração está disponível
export function isIntegrationAvailable(name: string): boolean {
  return IntegrationRegistry.get(name) !== undefined
}

// Tipos de integrações suportadas
export type IntegrationType = 'facebook' | 'whatsapp' | 'google-ads' | 'instagram'

// Configurações padrão para cada tipo de integração
export const INTEGRATION_CONFIGS = {
  facebook: {
    permissions: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_metadata', 
      'ads_read',
      'leads_retrieval'
    ],
    apiVersion: 'v18.0'
  },
  whatsapp: {
    permissions: ['whatsapp_business_messaging'],
    apiVersion: 'v1.0'
  }
} as const