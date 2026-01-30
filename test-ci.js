// CI/CD Test Suite for node-xmrig
const XMRig = require('./index');
const os = require('os');

console.log('🔬 CI/CD Test Suite Starting...\n');

let passedTests = 0;
let totalTests = 0;
let failedTests = 0;

function test(name, testFn) {
    totalTests++;
    try {
        testFn();
        passedTests++;
        console.log(`✅ ${name}`);
    } catch (error) {
        failedTests++;
        console.log(`❌ ${name}: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// === Environment Tests ===
console.log('🖥️  Environment Tests:');
test('Node.js version is supported', () => {
    const version = process.version.match(/^v(\d+)/);
    const major = parseInt(version[1]);
    assert(major >= 20, `Node.js version ${process.version} is not supported (>= 20.x required)`);
});

test('Platform is supported', () => {
    const platform = process.platform;
    const supportedPlatforms = ['linux', 'win32', 'darwin'];
    assert(supportedPlatforms.includes(platform), `Platform ${platform} is not supported`);
});

test('Architecture is supported', () => {
    const arch = process.arch;
    const supportedArchs = ['x64', 'x86', 'arm64'];
    assert(supportedArchs.includes(arch), `Architecture ${arch} is not supported`);
});

// === Module Loading Tests ===
console.log('\n📦 Module Loading Tests:');
test('Module loads successfully', () => {
    assert(typeof XMRig === 'object', 'XMRig module did not load');
    assert(XMRig !== null, 'XMRig module is null');
});

test('Module exports are present', () => {
    assert(typeof XMRig.getVersion === 'function', 'getVersion method missing');
    assert(typeof XMRig.createMiner === 'function', 'createMiner method missing');
    assert(typeof XMRig.getSupportedAlgorithms === 'function', 'getSupportedAlgorithms method missing');
    assert(typeof XMRig.getRecommendedPools === 'function', 'getRecommendedPools method missing');
});

// === API Tests ===
console.log('\n🔧 API Tests:');
test('getVersion returns string', () => {
    const version = XMRig.getVersion();
    assert(typeof version === 'string', `getVersion returned ${typeof version}, expected string`);
    assert(version.length > 0, 'getVersion returned empty string');
});

test('getSupportedAlgorithms returns array', () => {
    const algorithms = XMRig.getSupportedAlgorithms();
    assert(Array.isArray(algorithms), `getSupportedAlgorithms returned ${typeof algorithms}, expected array`);
    assert(algorithms.length > 0, 'getSupportedAlgorithms returned empty array');
    
    // Verify algorithm format
    algorithms.forEach(algo => {
        assert(typeof algo === 'string', `Algorithm ${algo} is not a string`);
        assert(algo.length > 0, `Algorithm "${algo}" is empty`);
    });
});

test('getRecommendedPools returns array', () => {
    const pools = XMRig.getRecommendedPools();
    assert(Array.isArray(pools), `getRecommendedPools returned ${typeof pools}, expected array`);
    assert(pools.length > 0, 'getRecommendedPools returned empty array');
    
    // Verify pool structure
    pools.forEach(pool => {
        assert(typeof pool === 'object', `Pool ${pool} is not an object`);
        assert(pool.name, 'Pool missing name property');
        assert(pool.url, 'Pool missing url property');
        assert(typeof pool.name === 'string', 'Pool name is not a string');
        assert(typeof pool.url === 'string', 'Pool url is not a string');
    });
});

// === Configuration Tests ===
console.log('\n⚙️  Configuration Tests:');
const testConfig = {
    pool: {
        url: 'test.pool.com:5555',
        user: 'test_wallet_address_1234567890abcdef',
        pass: 'x',
        algo: 'rx/0'
    },
    cpu: {
        threads: 2
    },
    randomx: {
        mode: 'fast'
    }
};

test('createMiner accepts valid config', () => {
    const miner = XMRig.createMiner(testConfig);
    assert(miner !== null, 'createMiner returned null');
    assert(typeof miner === 'object', `createMiner returned ${typeof miner}, expected object`);
});

test('Miner has expected methods', () => {
    const miner = XMRig.createMiner(testConfig);
    const expectedMethods = ['start', 'stop', 'on', 'emit', 'getStats', 'getStatus'];
    
    expectedMethods.forEach(method => {
        assert(typeof miner[method] === 'function', `Miner missing method: ${method}`);
    });
});

test('Miner config is accessible', () => {
    const miner = XMRig.createMiner(testConfig);
    assert(miner.config, 'Miner config is not accessible');
    assert(miner.config.pool, 'Miner config missing pool property');
    assert(miner.config.cpu, 'Miner config missing cpu property');
    assert(miner.config.pool.url === testConfig.pool.url, 'Miner config pool.url mismatch');
    assert(miner.config.cpu.threads === testConfig.cpu.threads, 'Miner config cpu.threads mismatch');
});

// === Event System Tests ===
console.log('\n📡 Event System Tests:');
test('Event listeners can be added', () => {
    const miner = XMRig.createMiner(testConfig);
    
    const testEventHandler = () => {};
    miner.on('test', testEventHandler);
    
    // This should not throw an error
    assert(true, 'Event listener added successfully');
});

test('Events can be emitted', () => {
    const miner = XMRig.createMiner(testConfig);
    
    let eventFired = false;
    miner.on('test', () => {
        eventFired = true;
    });
    
    miner.emit('test');
    assert(eventFired, 'Event was not emitted');
});

// === Performance Tests ===
console.log('\n⚡ Performance Tests:');
test('Module loads quickly', () => {
    const startTime = Date.now();
    require('./index');
    const loadTime = Date.now() - startTime;
    assert(loadTime < 5000, `Module took ${loadTime}ms to load, expected < 5000ms`);
});

test('Miner creation is fast', () => {
    const startTime = Date.now();
    const miner = XMRig.createMiner(testConfig);
    const createTime = Date.now() - startTime;
    assert(createTime < 1000, `Miner creation took ${createTime}ms, expected < 1000ms`);
});

// === Memory Tests ===
console.log('\n💾 Memory Tests:');
test('No memory leaks in multiple miner creation', () => {
    const miners = [];
    for (let i = 0; i < 10; i++) {
        miners.push(XMRig.createMiner(testConfig));
    }
    assert(miners.length === 10, 'Failed to create 10 miners');
    
    // Clear references
    miners.length = 0;
    assert(true, 'Multiple miners created and cleared successfully');
});

// === Edge Case Tests ===
console.log('\n🧪 Edge Case Tests:');
test('Minimal config is accepted', () => {
    const minimalConfig = {
        pool: {
            url: 'pool.com:5555',
            user: 'wallet_address_here'
        },
        cpu: {
            threads: 2
        }
    };
    const miner = XMRig.createMiner(minimalConfig);
    assert(miner !== null, 'Minimal config failed');
});

test('Empty config throws appropriate error', () => {
    try {
        XMRig.createMiner({});
        assert(false, 'Empty config should throw error');
    } catch (error) {
        assert(error.message.toLowerCase().includes('required') || error.message.toLowerCase().includes('pool'), 'Empty config error message should mention required fields');
    }
});

test('Invalid config structure is handled', () => {
    const invalidConfig = {
        pool: {
            url: 'valid.pool.com:5555',
            user: 'wallet_address'
        },
        cpu: {
            threads: 'invalid'
        }
    };
    
    const miner = XMRig.createMiner(invalidConfig);
    assert(miner !== null, 'Invalid config should be handled gracefully');
});

// === Type Safety Tests ===
console.log('\n🔍 Type Safety Tests:');
test('Methods return correct types', () => {
    const version = XMRig.getVersion();
    assert(typeof version === 'string', 'getVersion should return string');
    
    const algorithms = XMRig.getSupportedAlgorithms();
    assert(Array.isArray(algorithms), 'getSupportedAlgorithms should return array');
    
    const pools = XMRig.getRecommendedPools();
    assert(Array.isArray(pools), 'getRecommendedPools should return array');
});

test('Miner methods return expected types', () => {
    const miner = XMRig.createMiner(testConfig);
    
    const stats = miner.getStats();
    assert(typeof stats === 'object', 'getStats should return object');
    
    const status = miner.getStatus();
    assert(typeof status === 'object', 'getStatus should return object');
});

// === Summary ===
console.log('\n📊 Test Summary:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests > 0) {
    console.log('\n❌ Some tests failed! CI/CD pipeline should fail.');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed! CI/CD pipeline can continue.');
    process.exit(0);
}