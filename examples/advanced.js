// Advanced configuration example
const { XMRig, getRecommendedPools } = require('node-xmrig');

// Show recommended pools
console.log('🎯 Recommended pools:');
const pools = getRecommendedPools();
pools.forEach(pool => {
    console.log(`  • ${pool.name}: ${pool.url} (${pool.region})`);
});

// Advanced configuration
const config = {
    // CPU configuration
    cpu: {
        enabled: true,
        threads: 8, // Use 8 CPU threads
        asm: true, // Enable assembly optimizations
        affinity: 0xFF // Use first 8 CPU cores
    },
    
    // Pool configuration
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_address_here',
        pass: 'x',
        algo: 'rx/0', // RandomX algorithm for Monero
        donate: 1, // 1% donation to developers
        ssl: true // Enable SSL for secure connection
    },
    
    // Mining configuration
    mining: {
        enabled: true,
        mode: 'pool' // Mining in pool mode
    },
    
    // Logging configuration
    log: {
        level: 'info', // Log level: trace, debug, info, notice, warning, error
        file: './xmrig.log', // Log to file
        maxSize: 100, // Maximum log file size in MB
        rotate: true // Enable log rotation
    },
    
    // Performance configuration
    performance: {
        idleWait: 1000, // Wait 1 second when idle
        pauseOnBattery: false, // Don't pause on battery
        pauseOnActive: false, // Don't pause when user is active
        healthPrintTime: 60 // Print health info every 60 seconds
    },
    
    // RandomX configuration (for Monero mining)
    randomx: {
        mode: 'fast', // Fast mode for better performance
        threads: 4, // Use 4 RandomX threads (usually same as CPU threads)
        init: 5000, // 5 seconds initialization time
        maxIterations: 1000000, // Maximum iterations
        scratchpad: 64, // 64MB scratchpad memory
        numEvictedPages: 1 // Number of evicted pages
    }
};

// Create miner with advanced config
const miner = new XMRig(config);

// Event handlers
miner.on('started', (data) => {
    console.log(`🚀 Miner started with PID: ${data.pid}`);
    console.log(`📊 Configuration: ${data.args.slice(1).join(' ')}`);
});

miner.on('hash', (data) => {
    // Format hash rate nicely
    const formatted = formatHashRate(data.rate, data.unit);
    console.log(`🔢 Current hash rate: ${formatted}`);
    console.log(`📈 Highest hash rate: ${formatHashRate(data.highest, data.unit)}`);
});

miner.on('share', (data) => {
    const status = data.accepted ? '✅' : '❌';
    console.log(`${status} Share ${data.id || 'N/A'} - Total: ${data.total}, Rejected: ${data.rejected}`);
});

miner.on('connection', (data) => {
    if (data.connected) {
        console.log(`🔗 Connected to pool: ${data.pool}`);
    } else {
        console.log(`🔌 Disconnected from pool: ${data.pool}`);
    }
});

miner.on('status', (data) => {
    console.log(`📊 Status Update:`);
    console.log(`  • Running: ${data.running}`);
    console.log(`  • Hash Rate: ${formatHashRate(data.hashRate)}`);
    console.log(`  • Uptime: ${formatTime(data.uptime)}`);
    console.log(`  • Shares: ${data.shares.accepted} accepted, ${data.shares.rejected} rejected`);
});

miner.on('stopped', (data) => {
    console.log(`🛑 Miner stopped after ${formatTime(data.uptime)}`);
    console.log(`💰 Final statistics: ${data.shares?.accepted || 0} accepted shares`);
});

miner.on('error', (error) => {
    console.error(`💥 Error: ${error.message}`);
    if (error.message.includes('connection')) {
        console.log('🔄 Will retry connection...');
    }
});

// Helper function to format hash rate
function formatHashRate(rate, unit = 'H/s') {
    if (rate >= 1e9) return `${(rate / 1e9).toFixed(2)} GH/s`;
    if (rate >= 1e6) return `${(rate / 1e6).toFixed(2)} MH/s`;
    if (rate >= 1e3) return `${(rate / 1e3).toFixed(2)} KH/s`;
    return `${rate.toFixed(2)} ${unit}`;
}

// Helper function to format time
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// Start mining
(async () => {
    try {
        await miner.start();
        
        // Monitor for 10 minutes then stop (for demo)
        setTimeout(async () => {
            console.log('⏰ Demo complete, stopping miner...');
            await miner.stop();
            process.exit(0);
        }, 600000); // 10 minutes
        
    } catch (error) {
        console.error('💥 Failed to start miner:', error.message);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 Graceful shutdown...');
    try {
        await miner.stop();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});