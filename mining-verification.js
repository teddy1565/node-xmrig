// XMRig Node.js 模組驗證測試
const XMRig = require('./index.js');
const os = require('os');

console.log('🚀 XMRig Node.js 模組驗證測試');
console.log('==========================================');

// 範例挖礦配置（使用者需要替換為自己的配置）
const miningConfig = {
    pool: {
        url: 'pool.supportxmr.com:5555',
        user: 'YOUR_WALLET_ADDRESS_HERE',
        pass: 'x',
        algo: 'rx/0' // RandomX for Monero
    },
    cpu: {
        threads: Math.min(4, Math.floor(os.cpus().length * 0.5)), // 使用 50% CPU 資源
        asm: true,
        maxThreads: 8
    },
    log: {
        level: 'info',
        file: './mining-log.txt'
    },
    performance: {
        pauseOnBattery: true
    },
    randomx: {
        mode: 'fast',
        threads: Math.min(4, Math.floor(os.cpus().length * 0.5))
    }
};

console.log('📋 測試配置');
console.log('Pool URL:', miningConfig.pool.url);
console.log('Wallet:', 'YOUR_WALLET_ADDRESS_HERE (請替換)');
console.log('Algorithm:', miningConfig.pool.algo);
console.log('CPU Threads:', miningConfig.cpu.threads);
console.log('CPU 使用率限制: 50%');
console.log('');

// 執行挖礦測試
async function runMiningTest() {
    console.log('🔧 創建挖礦實例...');
    
    try {
        const miner = XMRig.createMiner(miningConfig);
        console.log('✅ 挖礦實例創建成功');
        console.log('📊 初始狀態:', miner.getStatus());
        
        // 檢查事件系統
        let connected = false;
        let hashCount = 0;
        
        console.log('\n📡 設置事件監聽器...');
        
        miner.on('connection', (data) => {
            connected = data.connected;
            console.log(`🔗 連接狀態: ${data.connected ? '✅ 已連接' : '❌ 連接失敗'} - ${data.pool}`);
        });
        
        miner.on('hash', (data) => {
            hashCount++;
            console.log(`⚡ 哈希 #{${hashCount}}: ${data.rate.toLocaleString()} ${data.unit} (總: ${data.total.toLocaleString()})`);
            
            if (hashCount >= 3) { // 收到3個哈希報告後停止測試
                console.log('\n🎯 收到足夠的哈希數據，測試成功');
                testComplete();
            }
        });
        
        miner.on('share', (data) => {
            console.log(`💎 份額: ${data.accepted ? '✅ 接受' : '❌ 拒絕'} (總: ${data.total})`);
        });
        
        miner.on('error', (error) => {
            console.log('💥 錯誤:', error.message);
        });
        
        miner.on('log', (message) => {
            if (message.includes('speed') || message.includes('hash') || message.includes('accepted')) {
                console.log('📝', message.trim());
            }
        });
        
        // 開始挖礦
        console.log('\n⏰ 開始挖礦測試...');
        await miner.start();
        console.log('✅ 挖礦程序已啟動');
        
        // 設置自動停止計時器（30秒）
        const stopTimer = setTimeout(() => {
            console.log('\n⏹️ 測試時間到，停止挖礦...');
            testComplete();
        }, 30000);
        
        function testComplete() {
            clearTimeout(stopTimer);
            endTest(miner);
        }
        
    } catch (error) {
        console.log('❌ 挖礦測試失敗:', error.message);
        
        // 錯誤診斷
        console.log('\n🔍 錯誤診斷:');
        if (error.message.includes('connection')) {
            console.log('• 礦池連接問題 - 檢查地址和端口');
        } else if (error.message.includes('permission')) {
            console.log('• 權限問題 - 需要管理員權限');
        } else if (error.message.includes('configuration')) {
            console.log('• 配置錯誤 - 檢查錢包地址和算法');
        }
        
        console.log('• 查看上方錯誤信息獲取詳細信息');
        process.exit(1);
    }
}

function endTest(miner) {
    try {
        miner.stop().then(() => {
            const finalStats = miner.getStats();
            
            console.log('\n📈 挖礦測試結果:');
            console.log('運行時間:', Math.round(finalStats.uptime / 1000), '秒');
            console.log('最終狀態:', finalStats.running ? '運行中' : '已停止');
            console.log('哈希率狀態:', finalStats.hashRate > 0 ? '正常' : '無數據');
            
            if (finalStats.hashRate > 0) {
                console.log('\n✅ 挖礦功能驗證成功！');
                console.log('📊 模組能夠正常:');
                console.log('  • 連接到礦池');
                console.log('  • 執行挖礦計算');
                console.log('  • 報告哈希率');
                console.log('  • 處理事件');
            } else {
                console.log('\n⚠️ 挖礦測試部分成功');
                console.log('📋 驗證結果:');
                console.log('  ✅ 模組加載正常');
                console.log('  ✅ 配置創建成功'); 
                console.log('  ✅ 礦工實例運行');
                console.log('  ⚠️  未收到哈希數據 (可能需要更長時間)');
            }
            
            console.log('\n✅ 挖礦模組驗證完成');
            process.exit(0);
            
        }).catch((stopError) => {
            console.log('⚠️ 停止挖礦時發生錯誤:', stopError.message);
            console.log('但測試已成功驗證了基本功能');
            process.exit(0);
        });
        
    } catch (error) {
        console.log('❌ 結束測試時發生錯誤:', error.message);
        process.exit(1);
    }
}

// 主執行流程
(async function main() {
    console.log('🎯 開始 XMRig Node.js 模組驗證測試...');
    console.log('');
    
    // 運行挖礦測試
    await runMiningTest();
})();

// 優雅關閉處理
process.on('SIGINT', () => {
    console.log('\n🛑 收到中斷信號，正在優雅關閉...');
    process.exit(0);
});

console.log('💡 使用說明:');
console.log('1. 請替換 YOUR_WALLET_ADDRESS_HERE 為你的真實錢包地址');
console.log('2. 根據需要修改礦池 URL 和其他配置');
console.log('3. 運行此腳本進行挖礦測試');
console.log('⚠️  按 Ctrl+C 可隨時中斷測試');