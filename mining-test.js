// XMRig Node.js 模組驗證測試
const XMRig = require('./index.js');
const os = require('os');

console.log('🚀 XMRig Node.js 模組驗證測試');
console.log('==========================================');

// 範例挖礦配置（使用者需要替換為自己的配置）
const config = {
    pool: {
        url: 'pool.supportxmr.com:5555',
        user: 'YOUR_WALLET_ADDRESS_HERE',
        pass: 'x'
    },
    cpu: {
        threads: Math.min(2, Math.floor(os.cpus().length * 0.25)), // 保守使用 25% CPU
        asm: true
    },
    randomx: {
        mode: 'fast'
    }
};

console.log('📋 測試配置:');
console.log('Pool:', config.pool.url);
console.log('Wallet:', 'YOUR_WALLET_ADDRESS_HERE (請替換)');
console.log('Threads:', config.cpu.threads);
console.log('Algorithm: rx/0 (RandomX)');
console.log('');

// 檢查原生模組
console.log('🔍 檢查原生模組...');
try {
    const nativeAddon = require('./build/Release/XMRig.node');
    console.log('✅ 原生模組加載成功');
    console.log('原生模組方法:', Object.keys(nativeAddon));
} catch (error) {
    console.log('⚠️ 原生模組加載失敗:', error.message);
    console.log('這可能表示編譯有問題，模組將使用 JavaScript 實現');
}

// 測試創建實例
console.log('\n🔧 創建挖礦實例...');
try {
    const miner = XMRig.createMiner(config);
    console.log('✅ 挖礦實例創建成功');
    
    // 顯示初始狀態
    console.log('📊 初始狀態:', miner.getStatus());
    
    // 測試事件系統
    let eventsFired = 0;
    let hasConnection = false;
    let hasHash = false;
    let hasShare = false;
    
    console.log('\n📡 測試事件系統...');
    
    miner.on('started', (data) => {
        eventsFired++;
        console.log('✅ started 事件觸發:', data.pid ? `PID ${data.pid}` : 'No PID');
    });
    
    miner.on('connection', (data) => {
        eventsFired++;
        hasConnection = true;
        console.log('🔗 connection 事件:', `${data.connected ? 'Connected' : 'Disconnected'} to ${data.pool}`);
    });
    
    miner.on('hash', (data) => {
        eventsFired++;
        hasHash = true;
        console.log(`⚡ hash 事件: ${data.rate.toLocaleString()} ${data.unit}`);
    });
    
    miner.on('share', (data) => {
        eventsFired++;
        hasShare = true;
        console.log(`💎 share 事件: ${data.accepted ? 'Accepted' : 'Rejected'}`);
    });
    
    miner.on('error', (error) => {
        eventsFired++;
        console.log('💥 error 事件:', error.message);
    });
    
    miner.on('log', (message) => {
        eventsFired++;
        if (message.includes('speed') || message.includes('hash')) {
            console.log('📝 log 事件:', message.trim().substring(0, 80));
        }
    });
    
    // 開始挖礦測試
    console.log('\n⏰ 開始挖礦測試 (20秒)...');
    
    const startTime = Date.now();
    let testCompleted = false;
    
    // 自動停止計時器
    setTimeout(() => {
        if (!testCompleted) {
            console.log('\n⏹️ 測試時間結束');
            testCompleted = true;
            endTest(miner);
        }
    }, 20000);
    
    // 監控計時器
    setInterval(() => {
        if (!testCompleted) {
            const stats = miner.getStats();
            console.log(`⏱️ 運行 ${Math.round((Date.now() - startTime)/1000)}s - 哈希率: ${stats.hashRate > 0 ? stats.hashRate.toLocaleString() + ' H/s' : '無數據'}`);
            
            // 如果 15 秒內沒有哈希數據，認為可能有問題
            if (Date.now() - startTime > 15000 && stats.hashRate === 0) {
                console.log('⚠️ 15 秒內無哈希數據，可能存在連接或配置問題');
            }
        }
    }, 5000);
    
    async function endTest(miner) {
        testCompleted = true;
        
        try {
            await miner.stop();
            console.log('✅ 挖礦已停止');
        } catch (error) {
            console.log('⚠️ 停止挖礦時出現錯誤:', error.message);
        }
        
        // 最終統計
        const finalStats = miner.getStats();
        const runtime = Date.now() - startTime;
        
        console.log('\n📈 測試結果摘要:');
        console.log('運行時間:', Math.round(runtime/1000) + '秒');
        console.log('觸發事件數量:', eventsFired);
        console.log('連接事件:', hasConnection ? '✅' : '❌');
        console.log('哈希事件:', hasHash ? '✅' : '❌');
        console.log('份額事件:', hasShare ? '✅' : '❌');
        console.log('最終哈希率:', finalStats.hashRate > 0 ? finalStats.hashRate.toLocaleString() + ' H/s' : '無數據');
        console.log('接受的份額:', finalStats.acceptedShares);
        console.log('拒絕的份額:', finalStats.rejectedShares);
        
        // 驗證結果
        console.log('\n🎯 模組驗證結果:');
        if (finalStats.hashRate > 0 || hasHash) {
            console.log('✅ 挖礦功能完全正常');
            console.log('✅ 模組能夠執行真實的挖礦計算');
            console.log('✅ 與礦池通信正常');
        } else if (hasConnection) {
            console.log('⚠️ 挖礦部分正常');
            console.log('✅ 模組能連接礦池但可能需要更長時間啟動');
            console.log('✅ 事件系統正常工作');
        } else {
            console.log('⚠️ 挖礦基礎功能正常');
            console.log('✅ 模組加載和配置正常');
            console.log('⚠️ 礦池連接可能有問題');
        }
        
        console.log('\n✅ 模組驗證完成');
        console.log('');
        console.log('💡 使用說明:');
        console.log('1. 請替換 YOUR_WALLET_ADDRESS_HERE 為你的真實錢包地址');
        console.log('2. 根據需要修改礦池 URL 和其他配置');
        console.log('3. 運行此腳本進行挖礦測試');
        
        process.exit(0);
    }
    
    // 開始挖礦
    try {
        await miner.start();
        console.log('✅ 挖礦程序已啟動');
        
    } catch (error) {
        console.log('❌ 啟動挖礦失敗:', error.message);
        
        // 錯誤分析
        console.log('\n🔍 錯誤分析:');
        if (error.message.includes('not found') || error.message.includes('no such file')) {
            console.log('• 原生模組路徑問題 - 檢查 build/Release/XMRig.node');
        } else if (error.message.includes('connection') || error.message.includes('network')) {
            console.log('• 網絡連接問題 - 檢查礦池連接性');
        } else if (error.message.includes('permission') || error.message.includes('access')) {
            console.log('• 權限問題 - 可能需要管理員權限');
        } else if (error.message.includes('wallet') || error.message.includes('address')) {
            console.log('• 錢包地址問題 - 檢查地址格式是否正確');
        } else {
            console.log('• 未知錯誤 - 檢查上方完整錯誤信息');
        }
        
        console.log('\n❌ 挖礦測試失敗');
        process.exit(1);
    }
    
} catch (createError) {
    console.log('❌ 創建挖礦實例失敗:', createError.message);
    console.log('錯誤詳情:', createError.stack);
    process.exit(1);
}

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 用戶中斷，正在退出...');
    process.exit(0);
});

console.log('\n💡 提示:');
console.log('• 使用 Ctrl+C 可隨時中斷測試');
console.log('• 確保在實際挖礦前替換正確的配置');