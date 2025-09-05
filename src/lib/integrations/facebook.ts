import { BaseIntegration, IntegrationStatus, IntegrationMetric, IntegrationLead } from './base'
import { supabase } from '@/lib/supabase'

export class FacebookIntegration extends BaseIntegration {
  name = 'facebook'
  displayName = 'Facebook'
  description = 'Integração com Facebook Marketing API para métricas e leads'
  icon = 'Facebook'
  color = '#1877F2'

  async connect(userId: string): Promise<string> {
    const permissions = [
      'pages_show_list',
      'pages_read_engagement', 
      'pages_manage_metadata',
      'ads_read',
      'leads_retrieval'
    ].join(',')

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/facebook/connect/callback`
    
    const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    facebookAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!)
    facebookAuthUrl.searchParams.set('redirect_uri', redirectUri)
    facebookAuthUrl.searchParams.set('scope', permissions)
    facebookAuthUrl.searchParams.set('response_type', 'code')
    facebookAuthUrl.searchParams.set('state', userId)

    return facebookAuthUrl.toString()
  }

  async disconnect(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from('facebook_integrations')
      .update({ is_active: false })
      .eq('id', integrationId)

    if (error) {
      throw new Error(`Erro ao desconectar integração: ${error.message}`)
    }
  }

  async getMetrics(integrationId: string): Promise<IntegrationMetric[]> {
    // Buscar dados de insights do Supabase
    const { data: insights, error } = await supabase
      .from('facebook_insights')
      .select('*')
      .eq('integration_id', integrationId)
      .gte('date_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date_start', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`)
    }

    // Agrupar métricas por nome
    const groupedMetrics = insights.reduce((acc, insight) => {
      if (!acc[insight.metric_name]) {
        acc[insight.metric_name] = []
      }
      acc[insight.metric_name].push(insight)
      return acc
    }, {} as Record<string, Array<{metric_name: string, metric_value: number, metric_period: string}>>)

    // Converter para formato padronizado
    const metrics: IntegrationMetric[] = []
    
    Object.entries(groupedMetrics).forEach(([metricName, data]) => {
      const latestValue = data[0]?.metric_value || 0
      const previousValue = data[1]?.metric_value || 0
      const change = latestValue - previousValue
      
      metrics.push({
        name: this.getMetricDisplayName(metricName),
        value: latestValue,
        change: change,
        changeType: change >= 0 ? 'increase' : 'decrease',
        period: data[0]?.metric_period || 'day',
        date: data[0]?.date_start || new Date().toISOString().split('T')[0]
      })
    })

    return metrics
  }

  async getLeads(integrationId: string): Promise<IntegrationLead[]> {
    const { data: leads, error } = await supabase
      .from('facebook_leads')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_time', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar leads: ${error.message}`)
    }

    return leads.map(lead => ({
      id: lead.id,
      source: 'Facebook Lead Ads',
      name: lead.lead_data.name || lead.lead_data.full_name,
      email: lead.lead_data.email,
      phone: lead.lead_data.phone_number || lead.lead_data.phone,
      data: lead.lead_data,
      createdAt: lead.created_time,
      status: lead.status
    }))
  }

  async isConnected(userId: string): Promise<boolean> {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', userId)
      .single()

    if (!users) return false

    const { data: integration } = await supabase
      .from('facebook_integrations')
      .select('id')
      .eq('user_id', users.id)
      .eq('is_active', true)
      .single()

    return !!integration
  }

  async getConnectionStatus(userId: string): Promise<IntegrationStatus> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', userId)
        .single()

      if (!users) {
        return { isConnected: false, error: 'Usuário não encontrado' }
      }

      const { data: integration } = await supabase
        .from('facebook_integrations')
        .select('*')
        .eq('user_id', users.id)
        .eq('is_active', true)
        .single()

      if (!integration) {
        return { isConnected: false }
      }

      return {
        isConnected: true,
        connectionId: integration.id,
        accountName: integration.page_name,
        accountId: integration.page_id,
        lastSync: integration.updated_at
      }
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  private getMetricDisplayName(metricName: string): string {
    const displayNames: Record<string, string> = {
      'page_impressions': 'Impressões',
      'page_reach': 'Alcance',
      'page_engaged_users': 'Usuários Engajados',
      'page_post_engagements': 'Engajamentos em Posts',
      'page_clicks': 'Cliques',
      'page_fans': 'Seguidores'
    }
    
    return displayNames[metricName] || metricName
  }

  // Método para sincronizar dados do Facebook
  async syncData(integrationId: string): Promise<void> {
    const { data: integration } = await supabase
      .from('facebook_integrations')
      .select('*')
      .eq('id', integrationId)
      .single()

    if (!integration) {
      throw new Error('Integração não encontrada')
    }

    // Sincronizar insights
    await this.syncInsights(integration)
    
    // Sincronizar leads
    await this.syncLeads(integration)
  }

  private async syncInsights(integration: {id: string, page_id: string, access_token: string}): Promise<void> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const since = startDate.toISOString().split('T')[0]
    const until = endDate.toISOString().split('T')[0]

    const metrics = [
      'page_impressions',
      'page_reach', 
      'page_engaged_users',
      'page_post_engagements',
      'page_clicks',
      'page_fans'
    ]

    for (const metric of metrics) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${integration.page_id}/insights/${metric}?since=${since}&until=${until}&access_token=${integration.access_token}`
        )
        const data = await response.json()
        
        if (data.data && data.data.length > 0) {
          for (const dataPoint of data.data) {
            const values = dataPoint.values || []
            for (const value of values) {
              await supabase
                .from('facebook_insights')
                .upsert({
                  integration_id: integration.id,
                  metric_name: metric,
                  metric_value: value.value || 0,
                  metric_period: dataPoint.period || 'day',
                  date_start: value.end_time ? value.end_time.split('T')[0] : since,
                  date_end: value.end_time ? value.end_time.split('T')[0] : until
                }, {
                  onConflict: 'integration_id,metric_name,metric_period,date_start,date_end'
                })
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao sincronizar métrica ${metric}:`, error)
      }
    }
  }

  private async syncLeads(integration: {id: string, page_id: string, access_token: string}): Promise<void> {
    try {
      // Buscar formulários de lead ads
      const formsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${integration.page_id}/leadgen_forms?access_token=${integration.access_token}`
      )
      const formsData = await formsResponse.json()

      if (formsData.data) {
        for (const form of formsData.data) {
          // Buscar leads de cada formulário
          const leadsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${form.id}/leads?access_token=${integration.access_token}`
          )
          const leadsData = await leadsResponse.json()

          if (leadsData.data) {
            for (const lead of leadsData.data) {
              await supabase
                .from('facebook_leads')
                .upsert({
                  integration_id: integration.id,
                  facebook_lead_id: lead.id,
                  form_id: form.id,
                  form_name: form.name,
                  lead_data: lead.field_data ? this.processLeadData(lead.field_data) : {},
                  created_time: lead.created_time,
                  status: 'new'
                }, {
                  onConflict: 'facebook_lead_id'
                })
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar leads:', error)
    }
  }

  private processLeadData(fieldData: Array<{name: string, values: string[]}>): Record<string, string> {
    const processed: Record<string, string> = {}
    
    fieldData.forEach(field => {
      if (field.name && field.values && field.values.length > 0) {
        processed[field.name] = field.values[0]
      }
    })

    return processed
  }
}