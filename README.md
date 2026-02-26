あなたはシニアフルスタックエンジニアです。Next.js(App Router) + TypeScriptで、NotionをDBとして使う社内用CRM/案件管理ツールを実装してください。

# ゴール
- データはNotionのDatabaseに保存する（NotionがDB）
- UI/操作はNext.js側で完結する
- Notion APIはサーバー側（Route Handlers / Server Actions）からのみ呼び出す
- MVPとして「営業先管理」「クライアント別タスク管理」「営業先作成時のテンプレタスク自動生成」まで必ず動く状態にする

# 技術要件
- Next.js 15+ App Router（想定）
- TypeScript
- UIは最低限で良い（Tailwindがあれば使用、なければ素のCSSでOK）
- 環境変数で NOTION_API_KEY, NOTION_DATABASE_ID_* を管理
- Notion SDK（@notionhq/client）を使用
- 例外処理・バリデーション（最低限）を入れる
- サーバー側のAPIを用意し、フロントはfetchで呼ぶ構成でも、Server Actionsでも良い（保守しやすい方）

# Notion Databases（手動作成済み前提）
以下のDBをNotionに作成済み。各DBのDatabase IDを環境変数に設定する。
- Leads
- Clients
- Projects
- Tasks
- WorkLogs
- Invoices
- Transactions
- TaskTemplates

# データモデル（重要）
- Leads: Name(title), Status(select), Priority(select), Channel(select), Next Action(text), Next Action Date(date), Auto Tasks Created(checkbox), Client(relation)
- Clients: Name(title), Status(select), Default Rate (JPY/h)(number)
- Tasks: Name(title), Client(relation), Lead(relation), Status(select), Type(select), Priority(select), Due Date(date), Estimate Minutes(number), Billable(checkbox), Parent Task(relation optional)
- TaskTemplates: Name(title), Template Group(select), Default Type(select), Default Priority(select), Default Estimate Minutes(number), Offset Days(number), Is Parent(checkbox), Parent Template(relation to TaskTemplates)

まずはMVPで Leads / Clients / Tasks / TaskTemplates のCRUDと、テンプレタスク自動生成を実装する。
WorkLogs/Invoices/Transactionsは“空のページ（ルーティングだけ）”までで良いが、設計は残す。

# 画面要件（MVP）
1) /leads
- Leadsの一覧表示（Name, Status, Priority, Next Action Date）
- Statusをドロップダウンで即更新できる
- 「新規作成」ボタン → /leads/new

2) /leads/new
- Lead作成フォーム（Name, Status, Priority, Channel, Next Action, Next Action Date）
- 作成時に TaskTemplates のうち Template Group=営業 のテンプレを読み込み、Tasksを自動生成する
  - TasksはLeadに紐付ける（Lead relation）
  - 期限は Offset Days を使って Lead作成日から加算して設定
  - Is Parent / Parent Template の関係がある場合は、Tasksにも親子関係（Parent Task）を再現する（可能なら実装、難しければ1段階目は親子なしでも可）
- Lead作成後は /leads に戻す
- Auto Tasks Created を true にする

3) /clients
- Clients一覧（Name, Status）
- /clients/[id] で詳細

4) /clients/[id]
- そのClientに紐づくTasks一覧（Statusでカンバンorリスト）
- Task追加・Status更新・Due Date更新ができる

# API設計（例）
- GET /api/leads
- POST /api/leads
- PATCH /api/leads/:id (status等の部分更新)
- GET /api/task-templates?group=営業
- POST /api/leads/:id/generate-tasks (内部で呼ぶだけでもOK)
- GET /api/clients
- GET /api/clients/:id/tasks
- POST /api/tasks
- PATCH /api/tasks/:id

# 実装の注意
- Notionのプロパティ型（title, rich_text, select, date, relation, checkbox, number）を正しく扱う
- Notionから返るデータはUI用に整形する（null安全）
- レート制限に配慮し、テンプレタスク生成は可能なら逐次作成（Promise.allで爆発させない）

# 成果物
- プロジェクトの主要ファイル構成を提示
- Notionクライアントラッパー（lib/notion.ts など）を作る
- ルーティングと最低限のUIとAPIが動く状態のコードを出力
- 環境変数の例（.env.example）を出す