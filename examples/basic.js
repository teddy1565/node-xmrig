// Basic usage example for node-xmrig
const { XMRig } = require('node-xmrig');

// Simple configuration
const config = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: '4A6x4a4R4...your_wallet_address_here',
        pass: 'x'
    },
    cpu: {
        threads: 4  // Use 4 CPU cores
    }
};

// Create miner instance
const miner = new XMRig(config);

// Start mining
(async () => {
    try {
        console.log('🚀 Starting XMRig miner...');
        
        // Listen to events
        miner.on('started', (data) => {
            console.log(`✅ Miner started! PID: ${data.pid}`);
        });
        
        miner.on('hash', (data) => {
            console.log(`🔢 Hash rate: ${data.rate.toLocaleString()} ${data.unit}`);
        });
        
        miner.on('share', (data) => {
            if (data.accepted) {
                console.log(`✅ Share accepted! Total: ${data.total}, Rejected: ${data.rejected}`);
            } else {
                console.log(`❌ Share rejected`);
            }
        });
        
        miner.on('error', (error) => {
            console.error('💥 Error:', error.message);
        });
        
        miner.on('log', (message) => {
            if (message.includes('speed') || message.includes('accepted')) {
                console.log('📊', message);
            }
        });
        
        // Start the miner
        await miner.start();
        
        // Stop after 30 seconds for demo (remove this in production)
        setTimeout(async () => {
            console.log('🛑 Stopping miner...');
            await miner.stop();
            console.log('✅ Miner stopped successfully');
            process.exit(0);
        }, 30000);
        
    } catch (error) {
        console.error('💥 Failed to start miner:', error);
        process.exit(1);
    }
})();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, stopping miner...');
    try {
        await miner.stop();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});