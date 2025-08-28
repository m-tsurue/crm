// 車種マスタ - 人気車種データ（無料版）
const POPULAR_VEHICLE_MODELS = {
  "トヨタ": [
    "プリウス", "プリウスα", "プリウスPHV",
    "アクア", "カローラ", "カムリ", "クラウン",
    "ヴィッツ", "ヤリス", "パッソ", "ポルテ",
    "ハリアー", "RAV4", "C-HR", "ランドクルーザー",
    "ヴォクシー", "ノア", "エスクァイア", "シエンタ",
    "アルファード", "ヴェルファイア", "ハイエース",
    "86", "スープラ", "レクサスIS", "レクサスLS"
  ],
  "ホンダ": [
    "フィット", "フィット ハイブリッド", "シャトル",
    "ヴェゼル", "CR-V", "HR-V",
    "フリード", "フリード+", "ステップワゴン", "オデッセイ",
    "N-BOX", "N-WGN", "N-ONE", "N-VAN",
    "インサイト", "アコード", "シビック",
    "S660", "NSX"
  ],
  "日産": [
    "ノート", "マーチ", "ティーダ",
    "エクストレイル", "ジューク", "キックス",
    "セレナ", "NV200バネット", "エルグランド",
    "デイズ", "ルークス", "モコ",
    "スカイライン", "フーガ", "GT-R",
    "リーフ", "アリア"
  ],
  "マツダ": [
    "デミオ", "MAZDA2", "アクセラ", "MAZDA3",
    "アテンザ", "MAZDA6", "CX-3", "CX-5", "CX-8",
    "フレア", "フレアワゴン", "スクラムワゴン",
    "ビアンテ", "プレマシー", "MPV",
    "ロードスター", "RX-7", "RX-8"
  ],
  "スバル": [
    "インプレッサ", "レガシィ", "レヴォーグ",
    "XV", "フォレスター", "アウトバック",
    "WRX", "BRZ",
    "プレオ", "ステラ", "R2", "R1"
  ],
  "スズキ": [
    "スイフト", "スイフトスポーツ", "バレーノ",
    "イグニス", "クロスビー", "ハスラー",
    "ワゴンR", "アルト", "ラパン", "スペーシア",
    "ソリオ", "エリオ", "エスクード",
    "ジムニー", "ジムニーシエラ"
  ],
  "ダイハツ": [
    "ムーヴ", "ムーヴキャンバス", "タント", "ミラ",
    "ウェイク", "キャスト", "コペン",
    "トール", "ブーン", "テリオス",
    "ハイゼット", "アトレー"
  ],
  "三菱": [
    "ミラージュ", "eKワゴン", "eKスペース",
    "アウトランダー", "エクリプスクロス", "RVR",
    "デリカD:5", "パジェロ", "ランサー",
    "i-MiEV"
  ],
  "BMW": [
    "1シリーズ", "2シリーズ", "3シリーズ", "5シリーズ",
    "X1", "X3", "X5", "MINI"
  ],
  "メルセデス・ベンツ": [
    "Aクラス", "Cクラス", "Eクラス", "Sクラス",
    "GLA", "GLC", "GLE", "Vクラス"
  ],
  "アウディ": [
    "A1", "A3", "A4", "A6",
    "Q2", "Q3", "Q5", "TT"
  ],
  "フォルクスワーゲン": [
    "ポロ", "ゴルフ", "パサート", "ティグアン",
    "トゥーラン", "シャラン", "up!"
  ]
};

// 車種検索・提案クラス
class VehicleModelSuggestion {
  constructor() {
    this.popularModels = POPULAR_VEHICLE_MODELS;
    this.userInputHistory = new Map(); // 学習データ
    this.loadUserInputHistory();
  }

  // ユーザー入力履歴をローカルストレージから読み込み
  loadUserInputHistory() {
    try {
      const stored = localStorage.getItem('vehicle_input_history');
      if (stored) {
        this.userInputHistory = new Map(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load vehicle input history:', e);
    }
  }

  // ユーザー入力履歴をローカルストレージに保存
  saveUserInputHistory() {
    try {
      localStorage.setItem('vehicle_input_history', 
        JSON.stringify([...this.userInputHistory.entries()]));
    } catch (e) {
      console.warn('Failed to save vehicle input history:', e);
    }
  }

  // 検索候補を取得
  getSuggestions(input, limit = 8) {
    if (!input || input.length < 1) return [];

    const normalizedInput = this.normalizeText(input);
    const suggestions = new Set();

    // 1. 人気車種から完全一致・前方一致検索
    this.searchInPopularModels(normalizedInput, suggestions);

    // 2. ユーザー学習データから検索
    this.searchInUserHistory(normalizedInput, suggestions);

    // 3. 部分一致検索
    if (suggestions.size < limit) {
      this.searchPartialMatch(normalizedInput, suggestions);
    }

    // 4. 曖昧検索（ひらがな・カタカナ・英数字対応）
    if (suggestions.size < limit) {
      this.searchFuzzyMatch(input, suggestions);
    }

    return Array.from(suggestions).slice(0, limit);
  }

  // テキスト正規化
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[ァ-ヴ]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) // カタカナ→ひらがな
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角→半角
      .replace(/\s+/g, ''); // 空白除去
  }

  // 人気車種から検索
  searchInPopularModels(normalizedInput, suggestions) {
    Object.entries(this.popularModels).forEach(([maker, models]) => {
      models.forEach(model => {
        const normalizedModel = this.normalizeText(model);
        
        // 完全一致
        if (normalizedModel === normalizedInput) {
          suggestions.add(`${model} (${maker})`);
          return;
        }
        
        // 前方一致
        if (normalizedModel.startsWith(normalizedInput)) {
          suggestions.add(`${model} (${maker})`);
        }
      });
    });
  }

  // ユーザー学習データから検索
  searchInUserHistory(normalizedInput, suggestions) {
    this.userInputHistory.forEach((count, userInput) => {
      const normalizedUserInput = this.normalizeText(userInput);
      
      if (normalizedUserInput.includes(normalizedInput) || 
          normalizedInput.includes(normalizedUserInput)) {
        // 使用回数が多いものを優先
        const priority = count > 2 ? '⭐' : '';
        suggestions.add(`${priority}${userInput} (ユーザー入力)`);
      }
    });
  }

  // 部分一致検索
  searchPartialMatch(normalizedInput, suggestions) {
    Object.entries(this.popularModels).forEach(([maker, models]) => {
      models.forEach(model => {
        const normalizedModel = this.normalizeText(model);
        
        if (normalizedModel.includes(normalizedInput)) {
          suggestions.add(`${model} (${maker})`);
        }
      });
    });
  }

  // 曖昧検索
  searchFuzzyMatch(input, suggestions) {
    const patterns = [
      input,
      this.toHiragana(input),
      this.toKatakana(input),
      this.toHalfWidth(input)
    ];

    Object.entries(this.popularModels).forEach(([maker, models]) => {
      models.forEach(model => {
        patterns.forEach(pattern => {
          if (model.includes(pattern) && pattern.length >= 2) {
            suggestions.add(`${model} (${maker})`);
          }
        });
      });
    });
  }

  // ひらがな変換
  toHiragana(str) {
    return str.replace(/[ァ-ヴ]/g, s => 
      String.fromCharCode(s.charCodeAt(0) - 0x60));
  }

  // カタカナ変換
  toKatakana(str) {
    return str.replace(/[ぁ-ゔ]/g, s => 
      String.fromCharCode(s.charCodeAt(0) + 0x60));
  }

  // 半角変換
  toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => 
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  }

  // ユーザー入力を学習
  learnFromUserInput(input) {
    if (!input || input.length < 2) return;
    
    const normalized = input.trim();
    const currentCount = this.userInputHistory.get(normalized) || 0;
    this.userInputHistory.set(normalized, currentCount + 1);
    
    // 保存
    this.saveUserInputHistory();
    
    // 学習データが多すぎる場合は古いものを削除
    if (this.userInputHistory.size > 500) {
      const entries = [...this.userInputHistory.entries()]
        .sort((a, b) => b[1] - a[1]) // 使用回数でソート
        .slice(0, 400); // 上位400件のみ残す
      
      this.userInputHistory = new Map(entries);
      this.saveUserInputHistory();
    }
  }

  // よく使われる車種トップ10を取得
  getPopularUserInputs() {
    return [...this.userInputHistory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([model, count]) => ({ model, count }));
  }

  // 統計情報を取得
  getStats() {
    return {
      popularModelsCount: Object.values(this.popularModels)
        .reduce((sum, models) => sum + models.length, 0),
      learnedModelsCount: this.userInputHistory.size,
      totalInputs: [...this.userInputHistory.values()]
        .reduce((sum, count) => sum + count, 0)
    };
  }
}

// グローバルインスタンス
window.vehicleModelSuggestion = new VehicleModelSuggestion();