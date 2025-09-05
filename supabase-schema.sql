-- Criação das tabelas para o CRM Dashboard

-- Tabela de usuários (complementa a autenticação do Firebase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar integrações do Facebook
CREATE TABLE IF NOT EXISTS facebook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  facebook_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Tabela para armazenar métricas do Facebook Insights
CREATE TABLE IF NOT EXISTS facebook_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES facebook_integrations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_period TEXT NOT NULL, -- day, week, days_28
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, metric_name, metric_period, date_start, date_end)
);

-- Tabela para armazenar leads do Facebook Lead Ads
CREATE TABLE IF NOT EXISTS facebook_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES facebook_integrations(id) ON DELETE CASCADE,
  facebook_lead_id TEXT UNIQUE NOT NULL,
  form_id TEXT NOT NULL,
  form_name TEXT NOT NULL,
  lead_data JSONB NOT NULL,
  created_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_facebook_integrations_user_id ON facebook_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_integrations_page_id ON facebook_integrations(page_id);
CREATE INDEX IF NOT EXISTS idx_facebook_insights_integration_id ON facebook_insights(integration_id);
CREATE INDEX IF NOT EXISTS idx_facebook_insights_date ON facebook_insights(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_facebook_leads_integration_id ON facebook_leads(integration_id);
CREATE INDEX IF NOT EXISTS idx_facebook_leads_created_time ON facebook_leads(created_time);
CREATE INDEX IF NOT EXISTS idx_facebook_leads_status ON facebook_leads(status);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_integrations_updated_at BEFORE UPDATE ON facebook_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_leads_updated_at BEFORE UPDATE ON facebook_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_leads ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own integrations" ON facebook_integrations
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can view own insights" ON facebook_insights
  FOR ALL USING (integration_id IN (
    SELECT fi.id FROM facebook_integrations fi
    JOIN users u ON fi.user_id = u.id
    WHERE u.firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can manage own leads" ON facebook_leads
  FOR ALL USING (integration_id IN (
    SELECT fi.id FROM facebook_integrations fi
    JOIN users u ON fi.user_id = u.id
    WHERE u.firebase_uid = auth.jwt() ->> 'sub'
  ));