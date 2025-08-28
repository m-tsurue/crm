# CLAUDE.md - セッション継続情報

## プロジェクト概要
BUDDICA CRMシステムのプロトタイプ開発
- 目標: Supabase + Vercel での高精度プロトタイプ
- 対象: カーライフアドバイザーのiPad活用
- デザイン: https://buddica.direct/ のミニマルスタイル

## 現在の進捗状況

### 完了済み
- ✅ 新規顧客登録フォーム (`prototype/新規顧客登録フォーム.html`)
- ✅ 顧客詳細画面 (`prototype/顧客詳細画面.html`)
- ✅ 車種マスタ安価実現方式 (`prototype/vehicle-models.js`)
- ✅ システムフロー設計ドキュメント作成

### 次のタスク（優先順）
1. **ニーズヒアリング画面** - 顧客の詳細な要望聞き取り
2. **在庫検索・車両詳細画面** - EXTREME連携予定
3. **見積もり作成画面** - 価格提案機能

## 技術スタック
- フロントエンド: HTML/CSS/JS（プロトタイプ段階）
- 将来: Next.js 14 + Tailwind CSS + shadcn/ui
- バックエンド: Supabase（PostgreSQL + Auth + Realtime）
- デプロイ: Vercel（現在静的サイト設定）
- 外部連携: EXTREME（在庫管理）+ BigQuery（分析）

## 重要な設計方針
1. **コスト効率**: 車種マスタは静的データ+学習型で無料実現
2. **リアルタイム性**: WebSocket活用
3. **iPad最適化**: 横向き1200px想定
4. **AI活用**: 購買意欲スコア・車両マッチング・成約予測

## 外部システム連携
- **EXTREME**: https://www.vertice.jp/service/extreme.php
- **BigQuery**: 経営ダッシュボード用データ
- **LINE API**: 店舗公式LINE連携
- **CarSensor/Goonet**: 外部問い合わせ取り込み

## 開発コマンド
```bash
# デプロイ確認
vercel --prod

# ローカルサーバー（必要時）
python -m http.server 8000
```

## ファイル構造
```
buddica-crm/
├── index.html                    # ランディングページ
├── prototype/
│   ├── 新規顧客登録フォーム.html    # 完成
│   ├── 顧客詳細画面.html          # 完成  
│   ├── vehicle-models.js         # 車種候補機能
│   └── [次: ニーズヒアリング画面.html]
├── docs/                         # 設計ドキュメント
└── vercel.json                   # 静的サイト設定
```

## 継続時の作業手順
1. TodoRead で現在のタスク確認
2. `prototype/` ディレクトリで次の画面HTML作成
3. 既存画面との遷移リンク追加
4. 必要に応じて git commit