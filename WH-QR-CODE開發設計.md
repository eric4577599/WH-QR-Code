# 📦 WH-QR-Code 倉儲掃描通 - 開發設計文件

> 本文件記錄專案從零到部署的完整過程，適合程式初學者理解現代 Web 應用開發流程。

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [系統架構圖](#系統架構圖)
3. [技術棧說明](#技術棧說明)
4. [開發流程](#開發流程)
5. [檔案結構](#檔案結構)
6. [部署流程](#部署流程)
7. [資料流程](#資料流程)
8. [使用者管理系統](#使用者管理系統)
9. [功能清單](#功能清單)

---

## 專案概述

### 🎯 目標
建立一個倉儲管理 PWA 應用，支援：
- QR Code 掃描入庫
- 訂單管理（新增、編輯、刪除、派車）
- 使用者管理（Email 登入、角色權限）
- 操作紀錄追蹤
- 即時資料同步
- 手機安裝使用

### 👥 使用情境
```
管理員 → 建立帳號 → 分配角色權限
倉管人員 → Email 登入 → 掃描 QR Code → 資料自動填入 → 儲存到雲端
司機 → Email 登入 → 查看待派車訂單
主管 → 查看操作紀錄 → 管理使用者
```

---

## 系統架構圖

### 整體架構
```mermaid
flowchart TB
    subgraph 使用者端
        A[📱 手機/電腦瀏覽器]
    end

    subgraph 前端應用 - Vercel
        B[React 應用程式]
        C[html5-qrcode 掃描器]
        D[Tailwind CSS 樣式]
    end

    subgraph 後端服務 - Firebase
        E[(Firestore 資料庫)]
        F[Authentication 身份驗證]
        G[(users 使用者)]
        H[(activity_logs 操作紀錄)]
    end

    subgraph 開發工具
        I[VS Code 編輯器]
        J[GitHub 版本控制]
        K[Vite 建置工具]
    end

    A <-->|HTTPS| B
    B --> C
    B --> D
    B <-->|即時同步| E
    B <-->|Email登入| F
    B <-->|角色權限| G
    B <-->|操作紀錄| H
    I -->|編寫程式| B
    I -->|git push| J
    J -->|自動部署| B
    K -->|npm run build| B
```

### 使用者操作流程
```mermaid
flowchart LR
    A[開啟 APP] --> B{已登入?}
    B -->|否| C[Email/密碼登入]
    B -->|否| C2[註冊新帳號]
    C --> D[驗證成功]
    C2 --> D
    D --> E[載入角色權限]
    E --> F[訂單列表]
    B -->|是| F
    F --> G{角色權限}
    G -->|管理員/倉管| H[點擊相機按鈕]
    G -->|司機| I[只能檢視]
    H --> J{選擇方式}
    J -->|掃描| K[開啟相機掃描 QR]
    J -->|上傳| L[選擇圖片]
    J -->|手動| M[直接填表單]
    K --> N[解析 QR 內容]
    L --> N
    N --> O[自動填入表單]
    M --> O
    O --> P{確認資料}
    P -->|儲存並下一筆| K
    P -->|儲存並返回| F
```

---

## 技術棧說明

| 類別 | 技術 | 用途 |
|------|------|------|
| **前端框架** | React 18 | 建立使用者介面元件 |
| **建置工具** | Vite | 快速開發與打包 |
| **樣式框架** | Tailwind CSS | 快速設計 UI 樣式 |
| **圖示庫** | Lucide React | 提供各種 icon |
| **掃描功能** | html5-qrcode | QR Code 掃描與解析 |
| **資料庫** | Firebase Firestore | 雲端 NoSQL 資料庫 |
| **身份驗證** | Firebase Auth | Email/密碼登入 |
| **版本控制** | Git + GitHub | 程式碼管理與協作 |
| **部署平台** | Vercel | 自動化部署與託管 |

---

## 開發流程

### 第一階段：環境建置
```mermaid
flowchart LR
    A[安裝 Node.js] --> B[npm create vite]
    B --> C[選擇 React 模板]
    C --> D[npm install]
    D --> E[安裝相依套件]
    E --> F[npm run dev 啟動]
```

**執行的指令：**
```bash
# 1. 建立專案
npm create vite@latest warehouse-scanner -- --template react

# 2. 進入專案
cd warehouse-scanner

# 3. 安裝基本相依
npm install

# 4. 安裝額外套件
npm install firebase html5-qrcode lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. 啟動開發伺服器
npm run dev
```

### 第二階段：Firebase 設定
```mermaid
flowchart TB
    A[前往 Firebase Console] --> B[建立新專案]
    B --> C[啟用 Firestore Database]
    C --> D[選擇測試模式]
    D --> E[啟用 Authentication]
    E --> F[開啟 Email/密碼登入]
    F --> G[取得設定金鑰]
    G --> H[貼到 App.jsx]
```

### 第三階段：程式開發
```mermaid
flowchart TB
    A[設計 UI 介面] --> B[實作 Email 登入/註冊]
    B --> C[實作使用者角色系統]
    C --> D[實作訂單列表]
    D --> E[實作新增/編輯訂單]
    E --> F[實作 QR 掃描]
    F --> G[實作派車功能]
    G --> H[實作操作紀錄]
    H --> I[測試與除錯]
```

### 第四階段：部署上線
```mermaid
flowchart LR
    A[git add .] --> B[git commit]
    B --> C[git push GitHub]
    C --> D[Vercel 偵測更新]
    D --> E[自動建置]
    E --> F[部署完成]
    F --> G[取得網址]
```

---

## 檔案結構

```
WH-QR-Code/
├── 📁 src/                    # 原始碼目錄
│   ├── 📄 App.jsx             # 主要應用程式 (所有功能都在這)
│   ├── 📄 main.jsx            # 程式進入點
│   └── 📄 index.css           # Tailwind CSS 引入
├── 📁 public/                 # 靜態資源
├── 📄 index.html              # HTML 模板
├── 📄 package.json            # 專案設定與相依套件
├── 📄 vite.config.js          # Vite 建置設定
├── 📄 tailwind.config.js      # Tailwind 設定
├── 📄 postcss.config.js       # PostCSS 設定
└── 📄 WH-QR-CODE開發設計.md   # 本文件
```

### App.jsx 程式結構
```mermaid
flowchart TB
    subgraph App.jsx
        A[Firebase 設定] --> B[常數定義]
        B --> C[USER_ROLES 角色定義]
        B --> D[ROLE_PERMISSIONS 權限定義]

        A --> E[LoginScreen 元件]
        A --> F[OrderCard 元件]
        A --> G[ScannerModal 元件]
        A --> H[OrderDetailModal 元件]
        A --> I[App 主元件]

        E --> J[Email 登入/註冊]
        F --> K[訂單卡片顯示]
        G --> L[QR 掃描功能]
        G --> M[表單輸入]
        H --> N[訂單詳情/編輯]
        I --> O[訂單列表管理]
        I --> P[派車功能]
        I --> Q[使用者管理 Modal]
        I --> R[操作紀錄 Modal]
    end
```

---

## 部署流程

### GitHub + Vercel 自動部署
```mermaid
sequenceDiagram
    participant 開發者
    participant VS Code
    participant GitHub
    participant Vercel
    participant 使用者

    開發者->>VS Code: 修改程式碼
    VS Code->>VS Code: git add -A
    VS Code->>VS Code: git commit -m "訊息"
    VS Code->>GitHub: git push
    GitHub->>Vercel: Webhook 通知
    Vercel->>Vercel: npm run build
    Vercel->>Vercel: 部署到 CDN
    Vercel-->>GitHub: 回報部署狀態
    使用者->>Vercel: 訪問網址
    Vercel-->>使用者: 返回網頁
```

### 部署指令速查
```bash
# 查看狀態
git status

# 加入所有變更
git add -A

# 提交變更
git commit -m "說明這次改了什麼"

# 推送到 GitHub (觸發 Vercel 自動部署)
git push
```

---

## 資料流程

### Firestore 資料結構
```mermaid
erDiagram
    warehouse_orders {
        string id PK "文件 ID (自動產生)"
        string orderNumber "訂單編號 ORD-YYYYMMDD-XXX"
        string workOrderNumber "工單編號"
        string orderDate "訂單建立日"
        string expectedShipDate "預計出貨日"
        string customerName "客戶名稱"
        string productName "產品名稱"
        string poNumber "採購單號"
        number length "長度"
        number width "寬度"
        number height "高度"
        number quantity "數量"
        string fluteType "楞別"
        string status "狀態: pending/dispatched"
        string createdBy "建立者"
        string updatedBy "修改者"
        string dispatchedBy "派車者"
        timestamp createdAt "建立時間"
        timestamp updatedAt "修改時間"
        timestamp dispatchedAt "派車時間"
    }

    users {
        string id PK "使用者 UID"
        string email "Email"
        string displayName "顯示名稱"
        string role "角色: admin/warehouse/driver"
        timestamp createdAt "建立時間"
    }

    activity_logs {
        string id PK "紀錄 ID"
        string userId "使用者 ID"
        string userEmail "使用者 Email"
        string userName "使用者名稱"
        string action "操作類型"
        string details "操作詳情"
        timestamp createdAt "建立時間"
    }

    users ||--o{ warehouse_orders : "建立"
    users ||--o{ activity_logs : "產生"
```

### 資料同步流程
```mermaid
flowchart TB
    subgraph 手機 A
        A1[新增訂單]
    end

    subgraph Firebase
        B1[(Firestore)]
    end

    subgraph 手機 B
        C1[訂單列表]
    end

    subgraph 電腦
        D1[訂單列表]
    end

    A1 -->|寫入| B1
    B1 -->|即時同步| C1
    B1 -->|即時同步| D1
```

---

## 常見問題排解

### ❓ 樣式沒有載入 (只有文字)
**原因：** Tailwind CSS 沒有正確編譯
**解決：**
1. 確認 `tailwind.config.js` 的 `content` 設定正確
2. 確認 `src/index.css` 有引入 Tailwind 指令
3. 重新執行 `npm run build`

### ❓ 資料沒有儲存到 Firebase
**原因：** Firestore 安全規則阻擋
**解決：**
1. 前往 Firebase Console → Firestore → 規則
2. 改成測試模式規則 (allow read, write: if true)
3. 點擊發布

### ❓ QR Code 掃描沒反應
**原因：** 需要 HTTPS 和相機權限
**解決：**
1. 確認網址是 `https://` 開頭
2. 允許瀏覽器使用相機權限
3. 可改用「上傳圖片」功能

---

## 使用者管理系統

### 角色權限表
| 權限 | 管理員 (admin) | 倉管 (warehouse) | 司機 (driver) |
|------|:-------------:|:----------------:|:-------------:|
| 新增訂單 | ✅ | ✅ | ❌ |
| 編輯訂單 | ✅ | ✅ | ❌ |
| 刪除訂單 | ✅ | ❌ | ❌ |
| 派車 | ✅ | ✅ | ❌ |
| 管理使用者 | ✅ | ❌ | ❌ |
| 查看操作紀錄 | ✅ | ❌ | ❌ |

### 使用者管理流程
```mermaid
flowchart TB
    A[第一位註冊] --> B[自動成為管理員]
    C[後續註冊] --> D[預設為司機角色]
    B --> E[管理員可變更角色]
    D --> E
    E --> F{選擇角色}
    F --> G[管理員 - 完整權限]
    F --> H[倉管 - 操作權限]
    F --> I[司機 - 檢視權限]
```

### 操作紀錄追蹤
系統會自動記錄以下操作：
- 📝 **註冊** - 新使用者註冊
- ➕ **新增訂單** - 誰新增了什麼訂單
- ✏️ **修改訂單** - 誰修改了什麼訂單
- 🗑️ **刪除訂單** - 誰刪除了什麼訂單
- 🚚 **派車** - 誰派了哪些訂單
- 👤 **變更角色** - 誰的角色被變更

---

## 功能清單

### ✅ 已完成功能
- [x] QR Code 掃描入庫
- [x] 圖片上傳掃描
- [x] 手動輸入表單
- [x] 訂單列表顯示
- [x] 訂單搜尋與篩選
- [x] 日期篩選 (今天/本週/本月)
- [x] 訂單詳情檢視
- [x] 訂單編輯
- [x] 批次選擇派車
- [x] Email/密碼登入註冊
- [x] 使用者角色系統
- [x] 角色權限控制
- [x] 操作紀錄追蹤
- [x] 使用者管理介面

### 🔮 未來擴充方向

#### 🗺️ 智慧路線規劃（優先開發）
- [ ] **出貨地點管理** - 訂單新增出貨地址欄位
- [ ] **下貨時間設定** - 預設 30 分鐘，可依客戶調整
- [ ] **Google Maps 整合** - 自動計算最佳配送路線
- [ ] **預估時間計算** - 根據距離+下貨時間計算總時間
- [ ] **路線優化** - 多點配送的最佳順序建議

```mermaid
flowchart LR
    A[選擇派車訂單] --> B[讀取出貨地點]
    B --> C[Google Maps API]
    C --> D[計算最佳路線]
    D --> E[加入下貨時間]
    E --> F[產生配送計畫]
    F --> G[顯示路線圖+預估時間]
```

#### 📊 報表與分析
- [ ] 匯出 Excel 報表
- [ ] 庫存統計圖表
- [ ] 配送效率分析

#### 🏭 倉儲進階功能
- [ ] 多倉庫支援
- [ ] 庫位管理
- [ ] 庫存數量追蹤

#### 🔔 通知功能
- [ ] 推播通知
- [ ] LINE 通知整合
- [ ] Email 通知

#### 🎨 使用者體驗
- [ ] 深色模式
- [ ] 多語言支援
- [ ] 離線模式

---

## 參考資源

| 資源 | 連結 |
|------|------|
| React 官方文件 | https://react.dev |
| Vite 官方文件 | https://vitejs.dev |
| Tailwind CSS | https://tailwindcss.com |
| Firebase 文件 | https://firebase.google.com/docs |
| Vercel 文件 | https://vercel.com/docs |
| html5-qrcode | https://github.com/mebjas/html5-qrcode |

---

*最後更新：2025-11-28*

