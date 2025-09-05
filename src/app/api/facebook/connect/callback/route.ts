import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')

  if (error) {
    console.error('Erro na autorização do Facebook:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=facebook_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=missing_parameters`)
  }

  try {
    // Trocar o código por um access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/facebook/connect/callback`,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Erro ao obter access token:', tokenData.error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=token_exchange_failed`)
    }

    const accessToken = tokenData.access_token

    // Obter informações do usuário do Facebook
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`)
    const userData = await userResponse.json()

    // Obter páginas do usuário
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`)
    const pagesData = await pagesResponse.json()

    if (pagesData.data && pagesData.data.length > 0) {
      // Salvar a primeira página (ou permitir que o usuário escolha)
      const firstPage = pagesData.data[0]
      
      // Buscar o usuário no Supabase usando o state (userId)
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', state)
        .single()

      if (userError || !users) {
        console.error('Usuário não encontrado:', userError)
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=user_not_found`)
      }

      // Salvar a integração no Supabase
      const { error: integrationError } = await supabase
        .from('facebook_integrations')
        .upsert({
          user_id: users.id,
          facebook_user_id: userData.id,
          access_token: firstPage.access_token || accessToken,
          page_id: firstPage.id,
          page_name: firstPage.name,
          permissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'ads_read', 'leads_retrieval'],
          token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,page_id'
        })

      if (integrationError) {
        console.error('Erro ao salvar integração:', integrationError)
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=integration_save_failed`)
      }

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=facebook_connected`)
    } else {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=no_pages_found`)
    }
  } catch (error) {
    console.error('Erro no callback do Facebook:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=callback_failed`)
  }
}