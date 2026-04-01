-- Run this in your Supabase SQL editor: https://kaokctirvpjrjuhikvzo.supabase.co

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  repo_limit int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- GitHub App installations
CREATE TABLE IF NOT EXISTS github_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id bigint UNIQUE NOT NULL,
  account_login text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own installations" ON github_installations FOR SELECT USING (auth.uid() = user_id);

-- Repositories
CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id bigint REFERENCES github_installations(installation_id),
  github_repo_id bigint UNIQUE,
  full_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own repos" ON repositories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own repos" ON repositories FOR UPDATE USING (auth.uid() = user_id);

-- Scans
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  triggered_by text,
  commit_sha text,
  results jsonb,
  summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own scans" ON scans FOR SELECT USING (auth.uid() = user_id);

-- Auto-create free subscription on new user signup
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, repo_limit)
  VALUES (NEW.id, 'free', 'active', 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();
