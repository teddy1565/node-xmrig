# Node.js Native Module Binding Configuration Guide

## 📋 **配置符號說明**

### **<( 符號 - 編譯時路徑解析**
- `<(module_root_dir)` - 指向模組根目錄，在編譯時動態解析
- `<(target_name)` - 指向目標名稱
- `<(OS)` - 作業系統名稱 (win/mac/linux)

**範例**：
```gyp
"<(module_root_dir)/src/main.cpp"
# 編譯時會變成: /path/to/node-xmrig/src/main.cpp
```

### **<!( 符號 - 立即執行指令**
- `<!(node -p "require(\'node-addon-api\').include_dir")` 
- `<!(node -e "require(\'nan\')")`

**功能**：
- 在編譯配置生成時立即執行 JavaScript
- 動態獲取實際的路徑和設置
- 確保路徑的正確性和可移植性

**範例**：
```gyp
include_dirs: [
    '<!(node -p "require(\'node-addon-api\').include_dir")',
    # 會輸出實際的 include 路徑，例如:
    # /usr/local/lib/node_modules/node-addon-api
]
```

## 🔧 **binding.gyp 配置最佳實踐**

### **1. 依賴管理**
```gyp
dependencies: [
    "node-addon-api"  # ✅ 正確方式
],
include_dirs: [
    '<!(node -p "require(\'node-addon-api\').include_dir")',
    '<!(node -e "require(\'nan\')")'
]
```

**避免**：
```gyp
dependencies: [
    '<!(node -p "require(\'node-addon-api\').gyp")'  # ❌ 錯誤方式
]
```

### **2. 平台特定配置**

#### **Windows (MSVC)**
```gyp
['OS=="win"', {
    "libraries": [
        "-lcomctl32.lib",
        "-lkernel32.lib", 
        "-luser32.lib"
    ],
    "msvs_settings": {
        "VCCLCompilerTool": {
            "ExceptionHandling": 1,  # 啟用 C++ 異常
            "AdditionalOptions": [ "/FS" ]
        },
        "VCLinkerTool": {
            "GenerateDebugInformation": "true"
        }
    },
    "defines": [
        "NODE_ADDON_API_CPP_EXCEPTIONS"
    ]
}]
```

#### **macOS (Clang)**
```gyp
['OS=="mac"', {
    "cflags": [ "-fPIC", "-O3", "-std=c++17" ],
    "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.15"
    }
}]
```

#### **Linux (GCC/Clang)**
```gyp
['OS=="linux"', {
    "cflags": [ "-fPIC", "-O3" ],
    "ldflags": [ "-lpthread", "-ldl", "-lrt" ]
}]
```

### **3. C++ 異常處理**
```gyp
"cflags!": [ '-fno-exceptions' ],        # 移除 -fno-exceptions
"cflags_cc!": [ '-fno-exceptions' ],     # 移除 -fno-exceptions
"defines": [ "NODE_ADDON_API_CPP_EXCEPTIONS" ]
```

**重要性**：
- node-addon-api 需要 C++ 異常支持
- 移除 `-fno-exceptions` 旗標
- 添加適當的定義

### **4. 架構檢測**
```gyp
# 在構建時自動檢測架構
"conditions": [
    ['arch=="ia32"', {
        # x86 (32-bit) 特定配置
    }],
    ['arch=="x64"', {
        # x64 (64-bit) 特定配置  
    }],
    ['arch=="arm64"', {
        # ARM64 特定配置
    }]
]
```

## 📊 **完整的 binding.gyp 範例**

基於你提供的專業示例：

```json
{
    "targets": [
        {
            "target_name": "YourModule",
            "sources": [
                "index.cpp",
                "windows.cpp",
                "macos.cpp", 
                "linux.cpp"
            ],
            "include_dirs": [
                '<!(node -p "require(\'node-addon-api\').include_dir")',
                '<!(node -e "require(\'nan\')")'
            ],
            "dependencies": [ "node-addon-api" ],
            "cflags!": [ '-fno-exceptions' ],
            "cflags_cc!": [ '-fno-exceptions' ],
            "conditions": [
                ['OS=="win"', {
                    "libraries": [
                        "-l<(module_root_dir)/lib/win/ssl/libcrypto.lib",
                        "-lcomctl32.lib"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1
                        }
                    }
                }],
                ['OS=="mac"', {
                    "libraries": [ "-lpthread" ]
                }],
                ['OS=="linux"', {
                    "ldflags": [ "-lpthread", "-ldl" ]
                }]
            ]
        }
    ]
}
```

## 🚀 **編譯命令**

### **基本編譯**
```bash
npm run build
# 或
node-gyp configure && node-gyp build
```

### **指定架構**
```bash
# x64
node-gyp configure --arch=x64 && node-gyp build --arch=x64

# ARM64  
node-gyp configure --arch=arm64 && node-gyp build --arch=arm64

# x86 (32-bit)
node-gyp configure --arch=ia32 && node-gyp build --arch=ia32
```

### **Electron 編譯**
```bash
# 需要額外的 electron-rebuild
npx electron-rebuild
```

## ⚠️ **常見問題**

### **1. 路徑錯誤**
- ❌ `<(module_root)/src/file.cpp` (拼寫錯誤)
- ✅ `<(module_root_dir)/src/file.cpp`

### **2. 依賴引用錯誤**
- ❌ `'<!(node -p "require(\'module\').gyp")'`
- ✅ `'module'` + `include_dirs`

### **3. 缺少異常處理**
- ❌ 沒有移除 `-fno-exceptions`
- ✅ 移除並添加 `NODE_ADDON_API_CPP_EXCEPTIONS`

### **4. Windows 特定問題**
- 確保使用正確的靜態庫路徑
- 配置 MSVS 設置
- 添加適當的定義

## 📝 **檢查清單**

在提交配置前檢查：

- [ ] 使用正確的 `<(module_root_dir)` 路徑
- [ ] 使用 `<!(node -p)` 獲取動態路徑
- [ ] 移除問題的依賴引用
- [ ] 配置 C++ 異常處理
- [ ] 添加平台特定設置
- [ ] 檢查庫文件路徑是否正確
- [ ] 測試多個平台編譯

## 🔗 **相關資源**

- [Node.js 官方 binding.gyp 文檔](https://nodejs.org/api/addons.html)
- [node-addon-api GitHub](https://github.com/nodejs/node-addon-api)
- [nan GitHub](https://github.com/nodejs/nan)

這個配置指南基於你提供的專業示例，可以確保跨平台兼容性並避免常見的編譯問題。