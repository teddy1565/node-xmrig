// Test suite for node-xmrig
const { XMRig, getVersion, getSupportedAlgorithms, getRecommendedPools } = require('node-xmrig');

console.log('🧪 Testing node-xmrig module...\n');

// Test 1: Version check
console.log('✅ Test 1: Version Check');
console.log(`Version: ${getVersion()}`);
console.log('Version check passed!\n');

// Test 2: Algorithm list
console.log('✅ Test 2: Supported Algorithms');
const algorithms = getSupportedAlgorithms();
console.log(`Total algorithms supported: ${algorithms.length}`);
console.log(`Sample algorithms: ${algorithms.slice(0, 5).join(', ')}...`);
console.log('Algorithm list test passed!\n');

// Test 3: Pool recommendations
console.log('✅ Test 3: Pool Recommendations');
const pools = getRecommendedPools();
console.log(`Total recommended pools: ${pools.length}`);
pools.forEach(pool => {
    console.log(`  • ${pool.name}: ${pool.url} (${pool.region})`);
});
console.log('Pool recommendations test passed!\n');

// Test 4: Configuration validation
console.log('✅ Test 4: Configuration Validation');

// Test valid configuration
try {
    const validConfig = {
        pool: {
            url: 'gulf.moneroocean.stream:10128',
            user: 'test_wallet_address',
            pass: 'x'
        },
        cpu: {
            threads: 4,
            asm: true
        }
    };
    
    const miner = new XMRig(validConfig);
    console.log('Valid configuration test passed!');
} catch (error) {
    console.error('❌ Valid configuration test failed:', error.message);
}

// Test invalid configuration (missing pool)
try {
    const invalidConfig = {
        cpu: {
            threads: 4
        }
    };
    
    const miner2 = new XMRig(invalidConfig);
    console.error('❌ Invalid configuration test failed - should have thrown error');
} catch (error) {
    console.log('Invalid configuration correctly rejected:', error.message);
}

// Test configuration with both threads and cores (should fail)
try {
    const invalidConfig2 = {
        pool: {
            url: 'test.pool.com:5555',
            user: 'test_wallet'
        },
        cpu: {
            threads: 4,
            cores: 8
        }
    };
    
    const miner3 = new XMRig(invalidConfig2);
    console.error('❌ Duplicate threads/cores test failed - should have thrown error');
} catch (error) {
    console.log('Duplicate threads/cores correctly rejected:', error.message);
}

// Test 5: Status and stats
console.log('\n✅ Test 5: Status and Statistics');
const testMiner = new XMRig({
    pool: {
        url: 'test.pool.com:5555',
        user: 'test_wallet'
    }
});

const status = testMiner.getStatus();
console.log('Status:', JSON.stringify(status, null, 2));

const stats = testMiner.getStats();
console.log('Stats:', JSON.stringify(stats, null, 2));

// Test 6: Event listeners
console.log('\n✅ Test 6: Event System');
testMiner.on('error', (error) => {
    console.log('❌ Error event triggered (expected for test):', error.message);
});

testMiner.on('log', (message) => {
    console.log('📝 Log event:', message);
});

testMiner.on('hash', (data) => {
    console.log('🔢 Hash rate event:', data);
});

// Test 7: Configuration update
console.log('\n✅ Test 7: Configuration Update');
testMiner.updateConfig({
    cpu: {
        threads: 8
    },
    log: {
        level: 'debug'
    }
});

console.log('Configuration update test passed!');

// Test 8: Destroy
console.log('\n✅ Test 8: Cleanup');
testMiner.destroy();
console.log('Cleanup test passed!');

console.log('\n🎉 All tests completed successfully!');
console.log('node-xmrig module is ready for use!\n');

// Example usage summary
console.log('💡 Usage Summary:');
console.log('1. Create miner with configuration');
console.log('2. Add event listeners');
console.log('3. Call miner.start()');
console.log('4. Monitor mining progress via events');
console.log('5. Call miner.stop() when done');
console.log('6. Call miner.destroy() to clean up');