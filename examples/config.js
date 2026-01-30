// Configuration examples for node-xmrig
const { XMRig, getRecommendedPools } = require('node-xmrig');

console.log('🔧 node-xmrig Configuration Examples\n');

// Example 1: Basic Monero mining
console.log('📝 Example 1: Basic Monero Mining');
const basicConfig = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_here',
        pass: 'x'
    },
    cpu: {
        threads: 4  // Use 4 CPU threads
    }
};

const basicMiner = new XMRig(basicConfig);
console.log('Basic configuration:', JSON.stringify(basicConfig, null, 2));
console.log('');

// Example 2: Optimized Monero mining
console.log('📝 Example 2: Optimized Monero Mining');
const optimizedConfig = {
    cpu: {
        enabled: true,
        threads: 8,        // Use 8 CPU threads
        asm: true,         // Enable assembly optimizations
        affinity: 0xFF     // Bind to first 8 CPU cores
    },
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_here',
        pass: 'x',
        algo: 'rx/0',      // RandomX for Monero
        donate: 1,         // 1% donation
        ssl: true          // SSL connection
    },
    log: {
        level: 'info',
        file: './xmrig.log'
    },
    randomx: {
        mode: 'fast',
        threads: 4,
        init: 5000
    }
};

const optimizedMiner = new XMRig(optimizedConfig);
console.log('Optimized configuration:', JSON.stringify(optimizedConfig, null, 2));
console.log('');

// Example 3: Using recommended pools
console.log('📝 Example 3: Recommended Pools');
const recommendedPools = getRecommendedPools();
const firstPool = recommendedPools[0];

const poolConfig = {
    pool: {
        url: firstPool.url,
        user: '4A6x4a4R4...your_monero_wallet_here',
        algo: firstPool.algo,
        ssl: firstPool.ssl
    },
    cpu: {
        threads: 4
    }
};

console.log(`Using recommended pool: ${firstPool.name}`);
console.log('Pool configuration:', JSON.stringify(poolConfig, null, 2));
console.log('');

// Example 4: Custom algorithm (not Monero)
console.log('📝 Example 4: Custom Algorithm Mining');
const customAlgoConfig = {
    cpu: {
        threads: 6
    },
    pool: {
        url: 'pool.cryptonote.social:5555',
        user: 'your_wallet_address',
        algo: 'cn/fast',  // CryptoNight-Fast
        pass: 'x'
    },
    randomx: {
        mode: 'light'  // Light mode for slower CPU
    }
};

const customMiner = new XMRig(customAlgoConfig);
console.log('Custom algorithm configuration:', JSON.stringify(customAlgoConfig, null, 2));
console.log('');

// Example 5: Conservative settings (low resource usage)
console.log('📝 Example 5: Conservative Settings');
const conservativeConfig = {
    cpu: {
        threads: 2,        // Use only 2 threads
        asm: true
    },
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_here',
        pass: 'x'
    },
    performance: {
        pauseOnBattery: true,  // Pause on battery
        pauseOnActive: true,   // Pause when user is active
        healthPrintTime: 120   // Less frequent health prints
    }
};

const conservativeMiner = new XMRig(conservativeConfig);
console.log('Conservative configuration:', JSON.stringify(conservativeConfig, null, 2));
console.log('');

// Example 6: Minimal logging
console.log('📝 Example 6: Minimal Logging');
const minimalConfig = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_here'
    },
    cpu: {
        threads: 4
    },
    log: {
        level: 'error',   // Only show errors
        file: null        // No log file
    }
};

const minimalMiner = new XMRig(minimalConfig);
console.log('Minimal logging configuration:', JSON.stringify(minimalConfig, null, 2));
console.log('');

// Example 7: TypeScript usage example
console.log('📝 Example 7: TypeScript Usage');
const tsExample = `
// TypeScript example (save as .ts file)
import { XMRig, XMRigConfig } from 'node-xmrig';

interface MyMiningConfig extends XMRigConfig {
    // Custom fields
    custom?: {
        autoStop?: boolean;
        notifyOnShare?: boolean;
    };
}

const config: MyMiningConfig = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_monero_wallet_here',
        pass: 'x'
    },
    cpu: {
        threads: 4,
        asm: true
    },
    custom: {
        autoStop: false,
        notifyOnShare: true
    }
};

const miner = new XMRig(config);

// Type-safe event handling
miner.on('hash', (data: { rate: number; unit: string }) => {
    console.log(\`Hash rate: \${data.rate} \${data.unit}\`);
});

miner.on('share', (data: { accepted: boolean; total: number }) => {
    if (data.accepted) {
        console.log(\`✅ Share accepted! Total: \${data.total}\`);
    }
});

// Type-safe API usage
const stats = miner.getStats();
const status = miner.getStatus();

console.log(\`Running: \${status.running}\`);
console.log(\`Pool: \${status.pool}\`);

await miner.start();
`;

console.log('TypeScript example:');
console.log(tsExample);
console.log('');

// Example 8: Error handling scenarios
console.log('📝 Example 8: Error Handling');
const errorHandlingExample = `
// Error handling examples
const miner = new XMRig(config);

// Handle connection errors
miner.on('error', (error) => {
    if (error.message.includes('connection')) {
        console.log('🔄 Connection error, will retry...');
        // Implement retry logic
    } else if (error.message.includes('permission')) {
        console.log('🚫 Permission denied, check user rights');
    } else {
        console.log('💥 Other error:', error.message);
    }
});

// Handle different log levels
miner.on('log', (message) => {
    if (message.includes('error') || message.includes('ERROR')) {
        console.error('❌ Error:', message);
    } else if (message.includes('speed') || message.includes('share')) {
        console.log('📊 Info:', message);
    }
});
`;

console.log('Error handling examples:');
console.log(errorHandlingExample);

// Cleanup
console.log('\n🧹 Cleaning up example miners...');
[basicMiner, optimizedMiner, customMiner, conservativeMiner, minimalMiner].forEach(miner => {
    miner.destroy();
});

console.log('\n✅ Configuration examples completed!');
console.log('\n💡 Tips:');
console.log('1. Always specify your actual wallet address');
console.log('2. Start with conservative settings, then optimize');
console.log('3. Monitor CPU temperature during mining');
console.log('4. Use SSL pools for better security');
console.log('5. Test configuration before running long-term');