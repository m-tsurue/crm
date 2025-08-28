# BigQuery活用アーキテクチャ設計

## 現状のデータ基盤
- **EXTREME → BigQuery**: 経営管理ダッシュボード用にデータを集約
- **既存の活用**: 経営指標の可視化、レポート作成

## CRMでのBigQuery活用方針

### データフロー設計
```
[EXTREME] → [BigQuery] ← [新CRM(Supabase)]
                ↓
        [統合ダッシュボード]
        [分析・レポート]
        [AIモデル]
```

### 1. CRMからBigQueryへのデータ連携

#### 1.1 リアルタイムストリーミング
- **Supabase → BigQuery**
  - 商談活動データ
  - リード情報
  - 接客ログ
  - 見積もりデータ

#### 1.2 格納するCRM独自データ
```sql
-- 商談活動テーブル
activities {
  activity_id
  lead_id
  staff_id
  activity_type (来店/電話/メール)
  activity_date
  notes
  next_action
  stage (初回接触/提案/交渉/成約)
}

-- リード管理テーブル
leads {
  lead_id
  source (WEB/来店/紹介)
  interest_level
  budget_range
  preferred_vehicle_type
  first_contact_date
  assigned_staff_id
}

-- 見積もりテーブル
quotes {
  quote_id
  lead_id
  vehicle_id (EXTREMEのID)
  total_amount
  options_selected
  loan_simulation
  created_date
  valid_until
}
```

### 2. BigQueryでの統合分析

#### 2.1 EXTREME×CRMの統合ビュー
```sql
-- 商談から成約までの分析ビュー
CREATE VIEW sales_funnel_analysis AS
SELECT 
  l.lead_id,
  l.source,
  l.first_contact_date,
  COUNT(a.activity_id) as total_activities,
  MAX(q.total_amount) as max_quote_amount,
  e.contract_date,
  e.final_amount,
  DATETIME_DIFF(e.contract_date, l.first_contact_date, DAY) as days_to_close
FROM leads l
LEFT JOIN activities a ON l.lead_id = a.lead_id
LEFT JOIN quotes q ON l.lead_id = q.lead_id
LEFT JOIN extreme_sales e ON l.customer_id = e.customer_id
GROUP BY l.lead_id
```

#### 2.2 高度な分析機能
- **リードスコアリング**
  - 過去の成約パターンから見込み度を予測
  - 最適なフォローアップタイミング提案
- **在庫最適化**
  - 顧客の興味と在庫のマッチング分析
  - 売れ筋予測と仕入れ提案
- **営業効率分析**
  - スタッフ別の活動量と成約率
  - 最も効果的な営業手法の特定

### 3. CRMでのBigQuery活用

#### 3.1 リアルタイム参照
- **在庫情報の取得**
  ```typescript
  // BigQuery経由でEXTREMEデータを取得
  const getInventory = async (filters) => {
    const query = `
      SELECT * FROM extreme_inventory
      WHERE status = 'available'
      AND price BETWEEN @min_price AND @max_price
    `;
    return await bigquery.query(query, filters);
  };
  ```

- **顧客履歴の参照**
  ```typescript
  const getCustomerHistory = async (customerId) => {
    const query = `
      SELECT * FROM extreme_customers
      WHERE customer_id = @customerId
    `;
    return await bigquery.query(query, { customerId });
  };
  ```

#### 3.2 分析結果の活用
- **AIによる提案**
  - 類似顧客の購買パターンから車種提案
  - 成約確率の高い価格帯を提示
- **ダイナミックな情報提供**
  - 人気車種ランキング
  - 価格相場情報
  - 在庫回転率に基づく特別オファー

### 4. 統合ダッシュボード拡張

#### 4.1 新規追加指標
- **営業プロセス指標**
  - リードコンバージョン率
  - 平均商談期間
  - ステージ別の離脱率
- **接客品質指標**
  - 見積もり提示率
  - 再来店率
  - 顧客満足度（アンケート連動）

#### 4.2 予測分析
- **月次売上予測**
  - パイプライン情報から精度向上
  - 商談ステージ別の成約確率考慮
- **需要予測**
  - リード情報から将来の需要予測
  - 最適な在庫構成の提案

### 5. 実装上の利点

#### 5.1 既存資産の活用
- BigQueryの分析基盤をそのまま活用
- EXTREMEデータとの統合が容易
- 既存ダッシュボードの拡張で対応可能

#### 5.2 スケーラビリティ
- BigQueryの高速処理能力を活用
- データ量が増えても性能劣化なし
- 将来的なAI/ML活用の基盤

#### 5.3 コスト効率
- Supabaseは軽量なCRM機能に特化
- 重い分析処理はBigQueryで実行
- 必要に応じた課金体系

## データガバナンス

### セキュリティ
- 個人情報はSupabaseで暗号化
- BigQueryへは必要最小限のデータのみ
- アクセス権限の厳格な管理

### データ品質
- CRMでの入力時バリデーション
- BigQueryでのデータクレンジング
- 定期的な整合性チェック

## 段階的実装計画

### Phase 1
- Supabase → BigQueryの基本連携
- 在庫情報の参照機能
- 基本的な活動記録の蓄積

### Phase 2  
- 高度な分析ビューの作成
- AIスコアリング機能
- 統合ダッシュボード拡張

### Phase 3
- 完全な予測分析機能
- リアルタイムレコメンデーション
- 自動化された営業支援