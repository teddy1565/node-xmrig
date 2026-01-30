# CI/CD Pipeline 部署與維護指南

## 📋 概述

node-xmrig 項目已配置完整的 CI/CD pipeline，確保在多個平台和 Node.js 版本下的穩定性和兼容性。

## 🎯 Pipeline 架構

### 主要 Jobs

1. **test** - 跨平台測試矩陣
   - 作業系統：Ubuntu, Windows, macOS
   - Node.js 版本：20.x, 21.x, 22.x, 23.x
   - CPU 架構：x64, arm64
   - 總計：24 種平台組合

2. **build-native-only** - 原生建置測試
   - 驗證原生模組編譯
   - 確保所有平台建置成功

3. **security-scan** - 安全掃描
   - 依賴套件安全審計
   - 敏感資料檢測

4. **release-prep** - 發佈準備
   - 整合所有檢查結果
   - 生成發佈摘要

## 🚀 啟用 Pipeline

### 1. 準備 GitHub Repository

```bash
# 確保專案包含必要檔案
git add .
git commit -m "Add CI/CD pipeline configuration"
git push origin main
```

### 2. GitHub Actions 設定

Pipeline 將在以下情況觸發：
- 推送到 `main`, `master`, `develop` 分支
- 發起 Pull Request
- 手動觸發 (workflow_dispatch)

### 3. Repository Secrets 設定

若需要發佈到 npm 或其他服務器，在 GitHub Repository Settings > Secrets 中設定：

```
NPM_TOKEN              # NPM 發佈權杖
GITHUB_TOKEN          # GitHub 權杖 (自動提供)
```

## 📊 測試矩陣

### 支援的環境

| 作業系統 | Node.js 版本 | CPU 架構 | 狀態 |
|---------|-------------|----------|------|
| Ubuntu 20.04 | 20.x, 21.x, 22.x, 23.x | x64, arm64 | ✅ |
| Windows 10/11 | 20.x, 21.x, 22.x, 23.x | x64 | ✅ |
| macOS 12+ | 20.x, 21.x, 22.x, 23.x | x64, arm64 | ✅ |

### 測試內容

每個環境都會執行：

1. **環境檢查**
   - Node.js 版本驗證
   - 平台支援性確認
   - CPU 架構檢查

2. **依賴安裝**
   - npm install
   - package-lock.json 同步

3. **編譯測試**
   - 原生模組建置
   - 跨平台相容性

4. **功能測試**
   - 模組載入測試
   - API 功能驗證
   - 類型定義檢查

5. **效能測試**
   - 建置效能基準
   - 模組載入時間

6. **安全性檢查**
   - 依賴套件審計
   - 敏感資料檢測

## 🔧 維護指南

### 定期維護

1. **每月檢查**
   - Review GitHub Actions 執行結果
   - 檢查依賴套件更新
   - 確認測試覆蓋率

2. **每季更新**
   - 更新 CI/CD 設定
   - 評估新的 Node.js 版本支援
   - 檢查平台支援範圍

### 故障排除

#### 常見問題

**1. 編譯失敗**
```bash
# 檢查本地編譯
npm run rebuild

# 檢查錯誤日誌
cat .npm/_logs/latest-debug.log
```

**2. 測試失敗**
```bash
# 執行本地測試
npm run test:ci

# 檢查特定測試
node -e "require('./test-ci.js')"
```

**3. 依賴問題**
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### Pipeline 最佳化

1. **減少執行時間**
   - 使用測試快取
   - 平行執行作業
   - 避免不必要的建置

2. **提高穩定性**
   - 添加重試機制
   - 優化錯誤處理
   - 定期更新 GitHub Actions

3. **成本控制**
   - 限制執行時間
   - 智慧觸發條件
   - 資源使用優化

## 📈 監控與指標

### 關鍵指標

1. **建置成功率**
   - 目標：> 95%
   - 監控：每日執行結果

2. **測試覆蓋率**
   - 目標：> 90%
   - 監控：測試執行報告

3. **執行時間**
   - 目標：< 15 分鐘
   - 監控：每次執行時間

### 報告系統

Pipeline 自動生成：
- 執行摘要
- 測試報告
- 建置產物
- 安全掃描結果

## 🛡️ 安全策略

### 安全檢查

1. **依賴掃描**
   - npm audit
   - 漏洞檢測
   - 版本檢查

2. **程式碼安全**
   - 敏感資料檢測
   - 權限檢查
   - 憑證驗證

3. **發佈安全**
   - 版本簽名
   - 權限控制
   - 審計追蹤

### 合規要求

- **開源許可證**：MIT License
- **安全標準**：OWASP 指引
- **隱私政策**：無個人資料收集
- **數據處理**：僅處理挖礦相關配置

## 🎉 發佈流程

### 自動化發佈

1. **準備階段**
   - 代碼審查完成
   - 所有測試通過
   - 文檔更新

2. **發佈執行**
   - 版本標記
   - GitHub Release
   - NPM 發佈（可選）

3. **後續處理**
   - 變更日誌更新
   - 社群通知
   - 問題追蹤

### 手動發佈

```bash
# 本地發佈流程
npm version patch
git push --tags
npm publish
```

## 📞 支援與聯絡

### 問題回報

- **GitHub Issues**：技術問題和功能請求
- **Security Issues**：安全相關問題
- **Documentation**：文檔改進建議

### 社群資源

- **GitHub Repository**：https://github.com/teddy1565/node-xmrig
- **Documentation**：README.md
- **Examples**：examples/ 目錄

---

*本文檔最後更新：2026-01-30*