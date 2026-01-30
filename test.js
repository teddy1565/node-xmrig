// Simple test for node-xmrig module
const XMRig = require('./index');

console.log('🧪 Testing node-xmrig module...\n');

// Test basic functionality
console.log('📋 Basic Tests:');
console.log('Version:', XMRig.getVersion());
console.log('Algorithms count:', XMRig.getSupportedAlgorithms().length);
console.log('Pools count:', XMRig.getRecommendedPools().length);

console.log('\n⚙️  Configuration Test:');

const config = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_wallet_address_here',
        pass: 'x'
    },
    cpu: {
        threads: 4
    }
};

console.log('Testing miner creation with config...');
try {
    const miner = XMRig.createMiner(config);
    console.log('✅ Miner created successfully');
    console.log('Miner type:', typeof miner);
    
    // Check if miner has expected methods
    console.log('\n🔍 Miner Methods Check:');
    const methods = ['start', 'stop', 'on', 'emit', 'getStats', 'getStatus'];
    methods.forEach(method => {
        if (typeof miner[method] === 'function') {
            console.log(`✅ ${method}: function`);
        } else {
            console.log(`❌ ${method}: ${typeof miner[method]}`);
        }
    });
    
} catch (error) {
    console.log('❌ Error creating miner:', error.message);
}

console.log('\n🎯 Pool Recommendations:');
const pools = XMRig.getRecommendedPools();
pools.forEach((pool, index) => {
    console.log(`${index + 1}. ${pool.name}: ${pool.url} (${pool.region})`);
});

console.log('\n🧬 Supported Algorithms:');
const algos = XMRig.getSupportedAlgorithms();
console.log('Total algorithms:', algos.length);
console.log('Sample algorithms:', algos.slice(0, 5));

console.log('\n✅ All tests completed!');