import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID é obrigatório' }, { status: 400 })
  }

  // Permissões necessárias para o Facebook
  const permissions = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'ads_read',
    'leads_retrieval'
  ].join(',')

  // URL de callback
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/facebook/connect/callback`
  
  // URL de autorização do Facebook
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  facebookAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!)
  facebookAuthUrl.searchParams.set('redirect_uri', redirectUri)
  facebookAuthUrl.searchParams.set('scope', permissions)
  facebookAuthUrl.searchParams.set('response_type', 'code')
  facebookAuthUrl.searchParams.set('state', userId) // Usar userId como state para identificar o usuário

  return NextResponse.redirect(facebookAuthUrl.toString())
}