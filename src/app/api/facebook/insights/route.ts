import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID é obrigatório' }, { status: 400 })
  }

  try {
    // Buscar integração ativa do usuário
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', userId)
      .single()

    if (userError || !users) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { data: integration, error: integrationError } = await supabase
      .from('facebook_integrations')
      .select('*')
      .eq('user_id', users.id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integração do Facebook não encontrada' }, { status: 404 })
    }

    // Definir período (últimos 30 dias)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const since = startDate.toISOString().split('T')[0]
    const until = endDate.toISOString().split('T')[0]

    // Métricas que queremos buscar
    const metrics = [
      'page_impressions',
      'page_reach',
      'page_engaged_users',
      'page_post_engagements',
      'page_clicks',
      'page_fans'
    ]

    const insightsPromises = metrics.map(async (metric) => {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${integration.page_id}/insights/${metric}?since=${since}&until=${until}&access_token=${integration.access_token}`
        )
        const data = await response.json()
        return { metric, data: data.data || [] }
      } catch (error) {
        console.error(`Erro ao buscar métrica ${metric}:`, error)
        return { metric, data: [] }
      }
    })

    const insightsResults = await Promise.all(insightsPromises)

    // Processar e salvar os dados no Supabase
    const processedInsights = []
    
    for (const result of insightsResults) {
      if (result.data.length > 0) {
        for (const dataPoint of result.data) {
          const values = dataPoint.values || []
          for (const value of values) {
            const insightData = {
              integration_id: integration.id,
              metric_name: result.metric,
              metric_value: value.value || 0,
              metric_period: dataPoint.period || 'day',
              date_start: value.end_time ? value.end_time.split('T')[0] : since,
              date_end: value.end_time ? value.end_time.split('T')[0] : until
            }
            
            processedInsights.push(insightData)
          }
        }
      }
    }

    // Salvar insights no Supabase (upsert para evitar duplicatas)
    if (processedInsights.length > 0) {
      const { error: saveError } = await supabase
        .from('facebook_insights')
        .upsert(processedInsights, {
          onConflict: 'integration_id,metric_name,metric_period,date_start,date_end'
        })

      if (saveError) {
        console.error('Erro ao salvar insights:', saveError)
      }
    }

    // Buscar dados salvos para retornar
    const { data: savedInsights, error: fetchError } = await supabase
      .from('facebook_insights')
      .select('*')
      .eq('integration_id', integration.id)
      .gte('date_start', since)
      .lte('date_end', until)
      .order('date_start', { ascending: true })

    if (fetchError) {
      console.error('Erro ao buscar insights salvos:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar dados salvos' }, { status: 500 })
    }

    // Agrupar dados por métrica para facilitar o uso no frontend
    const groupedInsights = savedInsights.reduce((acc, insight) => {
      if (!acc[insight.metric_name]) {
        acc[insight.metric_name] = []
      }
      acc[insight.metric_name].push({
        date: insight.date_start,
        value: insight.metric_value,
        period: insight.metric_period
      })
      return acc
    }, {} as Record<string, Array<{metric_name: string, metric_value: number, metric_period: string}>>)

    return NextResponse.json({
      success: true,
      data: groupedInsights,
      integration: {
        page_name: integration.page_name,
        page_id: integration.page_id
      }
    })

  } catch (error) {
    console.error('Erro ao buscar insights do Facebook:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}