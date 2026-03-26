-- =============================================================================
-- HR-Farm / Recruitment Journey 共通スキーマ
-- Supabase マイグレーション SQL
-- 作成日: 2026-03-25
--
-- 概要:
--   採用管理プラットフォームMVPのデータベーススキーマ
--   hr-farm と recruitment-journey (attract-prototype) が共有するバックエンド
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. 拡張機能の有効化
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. カスタム型 (ENUM)
-- ---------------------------------------------------------------------------

-- 選考ステージ
CREATE TYPE interview_stage AS ENUM (
  'interview_1',   -- 一次選考
  'interview_2',   -- 二次選考
  'interview_3',   -- 三次選考
  'interview_4',   -- 四次選考
  'interview_final' -- 最終選考（= 内定通知）
);

-- AI生成コンテンツの種別
CREATE TYPE generated_output_type AS ENUM (
  'match_analysis',  -- マッチ分析
  'attract_story',   -- アトラクトストーリー
  'result_letter',   -- 合否通知レター
  'handover_note'    -- 引き継ぎメモ
);

-- AI生成コンテンツのステータス
CREATE TYPE generated_output_status AS ENUM (
  'generating', -- 生成中
  'draft',      -- 下書き
  'reviewed',   -- レビュー済み
  'sent'        -- 送信済み
);

-- 候補者の採用種別
CREATE TYPE hiring_type AS ENUM (
  'new_graduate',  -- 新卒
  'mid_career',    -- 中途
  'other'          -- その他
);

-- 候補者のステータス
CREATE TYPE candidate_status AS ENUM (
  'active',     -- 選考中
  'offered',    -- 内定
  'accepted',   -- 内定承諾
  'rejected',   -- 不合格
  'withdrawn',  -- 辞退
  'on_hold'     -- 保留
);

-- ドキュメント種別
CREATE TYPE document_type AS ENUM (
  'resume',       -- 履歴書
  'entry_sheet',  -- エントリーシート
  'portfolio',    -- ポートフォリオ
  'other'         -- その他
);

-- ---------------------------------------------------------------------------
-- 2. テーブル定義
-- ---------------------------------------------------------------------------

-- =========================================================================
-- tenants: マルチテナント管理（企業単位）
-- =========================================================================
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,                          -- 企業名
  slug        TEXT NOT NULL UNIQUE,                   -- URL用スラッグ
  plan        TEXT NOT NULL DEFAULT 'free',           -- 契約プラン
  settings    JSONB NOT NULL DEFAULT '{}',            -- テナント設定
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON tenants (slug);

-- =========================================================================
-- company_profiles: 企業の魅力情報・EVP (Employee Value Proposition)
-- =========================================================================
CREATE TABLE company_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,                       -- 企業名（表示用）
  industry        TEXT,                                -- 業種
  company_size    TEXT,                                -- 企業規模
  mission         TEXT,                                -- ミッション
  vision          TEXT,                                -- ビジョン
  values          TEXT,                                -- バリュー
  evp             JSONB NOT NULL DEFAULT '{}',         -- EVP（魅力ポイント構造化データ）
  -- EVP例: { "growth": "...", "culture": "...", "compensation": "...", "work_style": "..." }
  culture_keywords TEXT[],                             -- カルチャーキーワード
  attraction_points JSONB NOT NULL DEFAULT '[]',       -- 企業の魅力ポイント一覧
  website_url     TEXT,                                -- 企業サイトURL
  metadata        JSONB NOT NULL DEFAULT '{}',         -- その他メタデータ
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_company_profiles_tenant UNIQUE (tenant_id)
);

CREATE INDEX idx_company_profiles_tenant ON company_profiles (tenant_id);

-- =========================================================================
-- jobs: 求人情報（ターゲットペルソナ含む）
-- =========================================================================
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,                       -- 求人タイトル
  department      TEXT,                                -- 部署
  position_type   TEXT,                                -- 職種
  description     TEXT,                                -- 求人詳細
  requirements    JSONB NOT NULL DEFAULT '[]',         -- 必須要件
  preferred       JSONB NOT NULL DEFAULT '[]',         -- 歓迎要件
  target_persona  JSONB NOT NULL DEFAULT '{}',         -- ターゲットペルソナ
  -- target_persona例: {
  --   "personality_traits": ["主体性", "協調性"],
  --   "experience": "...",
  --   "skills": [...],
  --   "values": [...],
  --   "ideal_profile": "..."
  -- }
  hiring_type     hiring_type NOT NULL DEFAULT 'new_graduate',
  is_active       BOOLEAN NOT NULL DEFAULT true,       -- 公開中フラグ
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_tenant ON jobs (tenant_id);
CREATE INDEX idx_jobs_active ON jobs (tenant_id, is_active) WHERE is_active = true;

-- =========================================================================
-- candidates: 候補者情報
-- =========================================================================
CREATE TABLE candidates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,  -- 応募求人
  full_name       TEXT NOT NULL,                       -- 氏名
  email           TEXT,                                -- メールアドレス
  phone           TEXT,                                -- 電話番号
  source          TEXT,                                -- 流入経路（ナビサイト名等）
  hiring_type     hiring_type NOT NULL DEFAULT 'new_graduate',
  status          candidate_status NOT NULL DEFAULT 'active',
  current_stage   interview_stage,                     -- 現在の選考ステージ
  university      TEXT,                                -- 大学名（新卒向け）
  faculty         TEXT,                                -- 学部
  graduation_year INTEGER,                             -- 卒業年度
  work_experience JSONB NOT NULL DEFAULT '[]',         -- 職歴（中途向け）
  profile_summary TEXT,                                -- AIが抽出したプロフィール要約
  tags            TEXT[],                              -- タグ
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidates_tenant ON candidates (tenant_id);
CREATE INDEX idx_candidates_job ON candidates (tenant_id, job_id);
CREATE INDEX idx_candidates_status ON candidates (tenant_id, status);
CREATE INDEX idx_candidates_stage ON candidates (tenant_id, current_stage);

-- =========================================================================
-- candidate_documents: アップロードファイルのメタデータ
-- Supabase Storage と連携。実ファイルは Storage バケットに保存。
-- =========================================================================
CREATE TABLE candidate_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_type   document_type NOT NULL DEFAULT 'other',
  file_name       TEXT NOT NULL,                       -- 元ファイル名
  file_size       BIGINT,                              -- ファイルサイズ (bytes)
  mime_type       TEXT,                                -- MIMEタイプ
  storage_path    TEXT NOT NULL,                        -- Storage内のパス
  -- 形式例: "{tenant_id}/{candidate_id}/{uuid}.pdf"
  extracted_text  TEXT,                                 -- OCR / テキスト抽出結果
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_documents_candidate ON candidate_documents (candidate_id);
CREATE INDEX idx_candidate_documents_tenant ON candidate_documents (tenant_id);

-- =========================================================================
-- interviews: 選考データ（ステージごと）
-- 面接テキスト、候補者アンケート、面接官評価を格納
-- =========================================================================
CREATE TABLE interviews (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  candidate_id        UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id              UUID REFERENCES jobs(id) ON DELETE SET NULL,
  stage               interview_stage NOT NULL,
  interviewer_name    TEXT,                             -- 面接官名
  interviewer_role    TEXT,                             -- 面接官の役職
  interview_date      DATE,                            -- 面接実施日

  -- 面接内容テキスト（面接官がアップロード or 手入力）
  interview_text      TEXT,                             -- 面接メモ / 議事録テキスト

  -- 候補者アンケート（面接後に候補者が回答）
  candidate_survey    JSONB NOT NULL DEFAULT '{}',
  -- 例: {
  --   "interest_level": 4,          -- 志望度 (1-5)
  --   "understanding": 4,           -- 理解度 (1-5)
  --   "concerns": "...",            -- 不安・懸念点
  --   "attractive_points": "...",   -- 魅力に感じた点
  --   "questions": "..."            -- 質問事項
  -- }

  -- 面接官評価
  interviewer_evaluation JSONB NOT NULL DEFAULT '{}',
  -- 例: {
  --   "overall_score": 4,           -- 総合評価 (1-5)
  --   "culture_fit": 4,             -- カルチャーフィット (1-5)
  --   "skill_match": 3,             -- スキルマッチ (1-5)
  --   "communication": 4,           -- コミュニケーション力 (1-5)
  --   "motivation": 5,              -- 意欲 (1-5)
  --   "strengths": "...",           -- 強み
  --   "concerns": "...",            -- 懸念点
  --   "recommendation": "proceed",  -- proceed / hold / reject
  --   "notes": "..."               -- 自由記述
  -- }

  -- 温度感（候補者の志望度合い）- AI分析 + 手動調整
  temperature_score   INTEGER CHECK (temperature_score BETWEEN 1 AND 10),

  result              TEXT CHECK (result IN ('pass', 'fail', 'hold', 'pending')),
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 同一候補者の同一ステージは1レコードのみ
  CONSTRAINT uq_interviews_candidate_stage UNIQUE (candidate_id, stage)
);

CREATE INDEX idx_interviews_tenant ON interviews (tenant_id);
CREATE INDEX idx_interviews_candidate ON interviews (candidate_id);
CREATE INDEX idx_interviews_stage ON interviews (tenant_id, stage);

-- =========================================================================
-- generated_outputs: AI生成コンテンツ（全種類一元管理）
-- マッチ分析、アトラクトストーリー、合否通知レター、引き継ぎメモ
-- =========================================================================
CREATE TABLE generated_outputs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interview_id    UUID REFERENCES interviews(id) ON DELETE SET NULL,
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,

  output_type     generated_output_type NOT NULL,
  status          generated_output_status NOT NULL DEFAULT 'generating',
  stage           interview_stage,                     -- 対象ステージ（該当する場合）

  -- AI生成コンテンツ本体（JSONB で柔軟に格納）
  content         JSONB NOT NULL DEFAULT '{}',
  --
  -- match_analysis 例:
  -- {
  --   "overall_match_score": 82,
  --   "persona_fit": { "score": 85, "analysis": "..." },
  --   "strengths": ["...", "..."],
  --   "gaps": ["...", "..."],
  --   "summary": "..."
  -- }
  --
  -- attract_story 例:
  -- {
  --   "story_text": "...",
  --   "key_messages": ["...", "..."],
  --   "personalized_evp": { ... },
  --   "talking_points": ["...", "..."]
  -- }
  --
  -- result_letter 例:
  -- {
  --   "subject": "...",
  --   "body": "...",
  --   "temperature_adjustment": "warm",  -- warm / neutral / cool
  --   "result": "pass",
  --   "stage": "interview_1"
  -- }
  --
  -- handover_note 例:
  -- {
  --   "summary": "...",
  --   "key_observations": ["...", "..."],
  --   "recommended_approach": "...",
  --   "concerns_to_address": ["...", "..."],
  --   "candidate_temperature": 7,
  --   "next_stage_focus": "..."
  -- }

  -- 生成に使用したプロンプト / パラメータの記録（デバッグ・改善用）
  generation_params JSONB NOT NULL DEFAULT '{}',

  -- レビュー者情報
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,

  -- バージョニング（再生成対応）
  version         INTEGER NOT NULL DEFAULT 1,

  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_outputs_tenant ON generated_outputs (tenant_id);
CREATE INDEX idx_generated_outputs_candidate ON generated_outputs (candidate_id);
CREATE INDEX idx_generated_outputs_type ON generated_outputs (tenant_id, output_type);
CREATE INDEX idx_generated_outputs_interview ON generated_outputs (interview_id);
CREATE INDEX idx_generated_outputs_status ON generated_outputs (tenant_id, status);

-- ---------------------------------------------------------------------------
-- 3. updated_at 自動更新トリガー
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 全テーブルにトリガーを設定
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'tenants',
    'company_profiles',
    'jobs',
    'candidates',
    'candidate_documents',
    'interviews',
    'generated_outputs'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trigger_update_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security (RLS) — テナント分離
-- ---------------------------------------------------------------------------

-- 全テーブルで RLS を有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS ヘルパー関数: JWTからテナントIDを取得
-- Supabase Auth の JWT に app_metadata.tenant_id を設定する想定
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE;

-- ---------------------------------------------------------------------------
-- tenants テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "tenants_select_own"
  ON tenants FOR SELECT
  USING (id = public.get_tenant_id());

CREATE POLICY "tenants_update_own"
  ON tenants FOR UPDATE
  USING (id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- company_profiles テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "company_profiles_select_own"
  ON company_profiles FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "company_profiles_insert_own"
  ON company_profiles FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "company_profiles_update_own"
  ON company_profiles FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "company_profiles_delete_own"
  ON company_profiles FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- jobs テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "jobs_select_own"
  ON jobs FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "jobs_insert_own"
  ON jobs FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "jobs_update_own"
  ON jobs FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "jobs_delete_own"
  ON jobs FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- candidates テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "candidates_select_own"
  ON candidates FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "candidates_insert_own"
  ON candidates FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "candidates_update_own"
  ON candidates FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "candidates_delete_own"
  ON candidates FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- candidate_documents テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "candidate_documents_select_own"
  ON candidate_documents FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "candidate_documents_insert_own"
  ON candidate_documents FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "candidate_documents_update_own"
  ON candidate_documents FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "candidate_documents_delete_own"
  ON candidate_documents FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- interviews テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "interviews_select_own"
  ON interviews FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "interviews_insert_own"
  ON interviews FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "interviews_update_own"
  ON interviews FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "interviews_delete_own"
  ON interviews FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- generated_outputs テーブルのポリシー
-- ---------------------------------------------------------------------------
CREATE POLICY "generated_outputs_select_own"
  ON generated_outputs FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "generated_outputs_insert_own"
  ON generated_outputs FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "generated_outputs_update_own"
  ON generated_outputs FOR UPDATE
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "generated_outputs_delete_own"
  ON generated_outputs FOR DELETE
  USING (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- 5. Supabase Storage バケット設定
-- 候補者ドキュメント（履歴書、ES等）のアップロード先
-- ---------------------------------------------------------------------------

-- バケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents',
  false,                                               -- 非公開バケット
  10485760,                                            -- 10MB制限
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS ポリシー: テナント配下のファイルのみアクセス可能
-- パス形式: {tenant_id}/{candidate_id}/{filename}

-- SELECT（ダウンロード）
CREATE POLICY "storage_candidate_docs_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidate-documents'
    AND (storage.foldername(name))[1] = public.get_tenant_id()::text
  );

-- INSERT（アップロード）
CREATE POLICY "storage_candidate_docs_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidate-documents'
    AND (storage.foldername(name))[1] = public.get_tenant_id()::text
  );

-- UPDATE（上書き）
CREATE POLICY "storage_candidate_docs_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'candidate-documents'
    AND (storage.foldername(name))[1] = public.get_tenant_id()::text
  );

-- DELETE（削除）
CREATE POLICY "storage_candidate_docs_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'candidate-documents'
    AND (storage.foldername(name))[1] = public.get_tenant_id()::text
  );

-- ---------------------------------------------------------------------------
-- 6. ファネルステージ遷移追跡（承諾率向上のコア機能）
-- サービスコンセプト: 応募→面接化→通過→内定→承諾 の各転換率を可視化
-- ---------------------------------------------------------------------------

CREATE TYPE funnel_stage AS ENUM (
  'applied',          -- 応募
  'screening',        -- 書類選考中
  'interviewing',     -- 面接中
  'offered',          -- 内定
  'accepted',         -- 承諾
  'declined',         -- 辞退
  'rejected'          -- 不合格
);

CREATE TABLE stage_transitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,
  from_stage      funnel_stage,                              -- NULL = 初回（応募）
  to_stage        funnel_stage NOT NULL,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_stage_transitions_tenant ON stage_transitions (tenant_id);
CREATE INDEX idx_stage_transitions_candidate ON stage_transitions (candidate_id);
CREATE INDEX idx_stage_transitions_job ON stage_transitions (tenant_id, job_id);
CREATE INDEX idx_stage_transitions_date ON stage_transitions (tenant_id, transitioned_at);

ALTER TABLE stage_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stage_transitions_select_own"
  ON stage_transitions FOR SELECT
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "stage_transitions_insert_own"
  ON stage_transitions FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());

-- ---------------------------------------------------------------------------
-- 7. 便利なビュー
-- ---------------------------------------------------------------------------

-- ファネル分析ビュー（求人別の転換率）
CREATE OR REPLACE VIEW funnel_metrics_view AS
SELECT
  j.tenant_id,
  j.id AS job_id,
  j.title AS job_title,
  COUNT(DISTINCT c.id) AS total_applicants,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('active', 'offered', 'accepted'))
    AS active_candidates,
  COUNT(DISTINCT i.candidate_id) FILTER (WHERE i.id IS NOT NULL)
    AS interviewed,
  COUNT(DISTINCT i.candidate_id) FILTER (WHERE i.result = 'pass')
    AS passed,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'offered' OR c.status = 'accepted')
    AS offered,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'accepted')
    AS accepted,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'withdrawn')
    AS withdrawn,
  -- 転換率
  CASE WHEN COUNT(DISTINCT c.id) > 0
    THEN ROUND(COUNT(DISTINCT i.candidate_id) FILTER (WHERE i.id IS NOT NULL) * 100.0
         / COUNT(DISTINCT c.id), 1)
    ELSE 0 END AS interview_rate,
  CASE WHEN COUNT(DISTINCT i.candidate_id) FILTER (WHERE i.id IS NOT NULL) > 0
    THEN ROUND(COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('offered', 'accepted')) * 100.0
         / COUNT(DISTINCT i.candidate_id) FILTER (WHERE i.id IS NOT NULL), 1)
    ELSE 0 END AS offer_rate,
  CASE WHEN COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('offered', 'accepted')) > 0
    THEN ROUND(COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'accepted') * 100.0
         / COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('offered', 'accepted')), 1)
    ELSE 0 END AS acceptance_rate
FROM jobs j
LEFT JOIN candidates c ON c.job_id = j.id
LEFT JOIN interviews i ON i.candidate_id = c.id
WHERE j.is_active = true
GROUP BY j.tenant_id, j.id, j.title;

-- 候補者の選考進捗サマリー
CREATE OR REPLACE VIEW candidate_progress_view AS
SELECT
  c.id AS candidate_id,
  c.tenant_id,
  c.full_name,
  c.status,
  c.current_stage,
  c.job_id,
  j.title AS job_title,
  COUNT(i.id) AS completed_interviews,
  MAX(i.stage) AS latest_interview_stage,
  AVG(i.temperature_score) AS avg_temperature,
  (
    SELECT COUNT(*)
    FROM generated_outputs go
    WHERE go.candidate_id = c.id AND go.output_type = 'match_analysis'
  ) AS match_analyses_count,
  (
    SELECT COUNT(*)
    FROM generated_outputs go
    WHERE go.candidate_id = c.id AND go.output_type = 'attract_story'
  ) AS attract_stories_count,
  c.created_at,
  c.updated_at
FROM candidates c
LEFT JOIN jobs j ON c.job_id = j.id
LEFT JOIN interviews i ON c.id = i.candidate_id
GROUP BY c.id, c.tenant_id, c.full_name, c.status, c.current_stage,
         c.job_id, j.title, c.created_at, c.updated_at;

-- ---------------------------------------------------------------------------
-- 8. MVP初期データ（テスト用テナント）
-- ---------------------------------------------------------------------------

INSERT INTO tenants (id, name, slug, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'カケハシスカイソリューションズ', 'kakehashi', 'free')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 完了
-- ---------------------------------------------------------------------------
