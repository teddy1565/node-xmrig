# node-xmrig

A comprehensive Node.js wrapper for XMRig, providing full TypeScript support and an easy-to-use API for CPU-based cryptocurrency mining.

## 🚀 Features

- **Full TypeScript Support**: Complete type definitions with IntelliSense
- **Event-Driven API**: Real-time mining statistics and events
- **Flexible Configuration**: Support for all XMRig options
- **Easy Pool Setup**: Built-in pool recommendations
- **Resource Management**: CPU core control and optimization
- **Robust Error Handling**: Comprehensive error handling and logging
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📦 Installation

```bash
npm install node-xmrig
# or
yarn add node-xmrig
```

## ⚡ Quick Start

```javascript
const { XMRig } = require('node-xmrig');

const config = {
    pool: {
        url: 'gulf.moneroocean.stream:10128',
        user: 'your_monero_wallet_address_here',
        pass: 'x'
    },
    cpu: {
        threads: 4  // Use 4 CPU cores
    }
};

const miner = new XMRig(config);

miner.on('hash', (data) => {
    console.log(`Hash rate: ${data.rate.toLocaleString()} ${data.unit}`);
});

miner.on('share', (data) => {
    console.log(`Share ${data.accepted ? 'accepted' : 'rejected'}!`);
});

await miner.start();
```

## 📋 Configuration

### Basic Configuration

```typescript
interface XMRigConfig {
    cpu?: CpuConfig;
    pool: PoolConfig;
    mining?: MiningConfig;
    log?: LogConfig;
    performance?: PerformanceConfig;
    randomx?: RandomXConfig;
}
```

### CPU Configuration

```typescript
cpu: {
    enabled?: boolean;     // Enable/disable CPU mining (default: true)
    threads?: number;      // Number of CPU threads (default: auto-detect)
    cores?: number;        // Alternative to threads
    affinity?: number;     // CPU affinity mask
    asm?: boolean;         // Enable assembly optimizations (default: true)
    arith?: number;        // Arithmetic optimization level
    maxThreads?: number;   // Maximum threads limit
}
```

### Pool Configuration

```typescript
pool: {
    url: string;           // Pool URL (required)
    user: string;          // Wallet address (required)
    pass?: string;         // Pool password (default: 'x')
    algo?: string;         // Mining algorithm (default: 'rx/0')
    coin?: string;         // Specific coin to mine
    donate?: number;       // Donation level 0-100 (default: 1)
    nicehash?: boolean;    // Enable NiceHash support
    ssl?: boolean;         // Enable SSL connection
    tls?: boolean;         // Enable TLS connection
}
```

### RandomX Configuration (for Monero)

```typescript
randomx: {
    mode?: 'fast' | 'light';     // RandomX mode (default: 'fast')
    threads?: number;             // RandomX threads
    init?: number;                // Initialization time in ms
    maxIterations?: number;       // Maximum iterations
    scratchpad?: number;          // Scratchpad memory in MB
    numEvictedPages?: number;     // Number of evicted pages
}
```

### Logging Configuration

```typescript
log: {
    level?: 'trace' | 'debug' | 'info' | 'notice' | 'warning' | 'error';
    file?: string;                // Log file path
    maxSize?: number;             // Max file size in MB
    rotate?: boolean;             // Enable log rotation
}
```

### Performance Configuration

```typescript
performance: {
    idleWait?: number;            // Idle wait time in ms
    pauseOnBattery?: boolean;     // Pause mining on battery
    pauseOnActive?: boolean;      // Pause when system is active
    healthPrintTime?: number;     // Health print interval in seconds
}
```

## 🎯 Event API

The miner emits various events for real-time monitoring:

```typescript
miner.on('started', (data) => {
    // Miner has started
    // data: { pid: number, args: string[] }
});

miner.on('hash', (data) => {
    // Hash rate update
    // data: { rate: number, total: number, highest: number, unit: string }
});

miner.on('share', (data) => {
    // Share submission result
    // data: { accepted: boolean, id?: number, total: number, rejected: number }
});

miner.on('connection', (data) => {
    // Pool connection status
    // data: { pool: string, connected: boolean, timestamp: number }
});

miner.on('status', (data) => {
    // General status update
    // data: { running: boolean, hashRate: number, uptime: number, shares: {...} }
});

miner.on('error', (error) => {
    // Error occurred
    // error: Error object
});

miner.on('log', (message) => {
    // Log message from XMRig
    // message: string
});

miner.on('stopped', (data) => {
    // Miner has stopped
    // data: { code: number, signal: string, uptime: number }
});
```

## 📊 Statistics

Get current mining statistics:

```typescript
const stats = miner.getStats();
console.log(`Hash Rate: ${stats.hashRate} H/s`);
console.log(`Accepted Shares: ${stats.acceptedShares}`);
console.log(`Uptime: ${stats.uptime}ms`);

const status = miner.getStatus();
console.log(`Running: ${status.running}`);
console.log(`Pool: ${status.pool}`);
console.log(`Threads: ${status.threads}`);
```

## 🛠️ Methods

### Control Methods

- `start(): Promise<boolean>` - Start mining
- `stop(): Promise<boolean>` - Stop mining  
- `destroy(): void` - Destroy miner instance
- `updateConfig(config): void` - Update configuration

### Information Methods

- `getStats(): XMRigStats` - Get current statistics
- `getStatus(): XMRigStatus` - Get current status

## 💰 Recommended Pools

Get list of recommended mining pools:

```javascript
const { getRecommendedPools } = require('node-xmrig');
const pools = getRecommendedPools();

console.log('Recommended pools:');
pools.forEach(pool => {
    console.log(`${pool.name}: ${pool.url} (${pool.region})`);
});
```

## 🔧 Advanced Usage

### Custom Algorithm

```javascript
const config = {
    pool: {
        url: 'pool.cryptonote.social:5555',
        user: 'your_wallet_address',
        algo: 'cn/gpu'  // Custom algorithm
    }
};
```

### SSL Pool Configuration

```javascript
const config = {
    pool: {
        url: 'ssl.pool.supportxmr.com:5555',
        user: 'your_wallet_address',
        ssl: true  // Enable SSL
    }
};
```

### CPU Optimization

```javascript
const config = {
    cpu: {
        threads: 8,        // Use all available cores
        asm: true,         // Enable assembly optimizations
        affinity: 0xFF     // Bind to first 8 cores
    }
};
```

## 📈 Supported Algorithms

The module supports all XMRig algorithms:

- **RandomX**: `rx/0`, `rx/wow`, `rx/loki`, etc.
- **CryptoNight**: `cn/r`, `cn/fast`, `cn/2`, `cn/1`, etc.
- **Other**: `hash`, `blake2b`, `skein`, `groestl`, etc.

Get the full list:

```javascript
const { getSupportedAlgorithms } = require('node-xmrig');
console.log(getSupportedAlgorithms());
```

## 🛡️ Error Handling

```javascript
try {
    await miner.start();
} catch (error) {
    if (error.message.includes('connection')) {
        console.log('Connection failed, retrying...');
    } else if (error.message.includes('permission')) {
        console.log('Permission denied, check your user rights');
    } else {
        console.error('Unexpected error:', error);
    }
}
```

## ⚙️ Environment Requirements

- **Node.js**: >= 14.0.0
- **Operating System**: Windows, macOS, Linux
- **Architecture**: x64, x86
- **CPU**: Multi-core processor recommended

## 🚀 Performance Tips

1. **CPU Cores**: Use 50-75% of available cores to avoid system slowdown
2. **Assembly Optimizations**: Keep `asm: true` for better performance
3. **Memory**: RandomX mode requires sufficient RAM (2GB+)
4. **Thermal**: Monitor CPU temperature during mining

## 📝 Examples

See the `examples/` directory for complete working examples:

- `basic.js` - Simple mining setup
- `advanced.js` - Full-featured configuration with events
- `config.js` - Configuration examples
- `events.js` - Event handling examples

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided for educational purposes only. Mining cryptocurrency consumes significant amounts of electricity and resources. Ensure compliance with local laws and regulations. Use at your own risk.

## 🔗 Links

- [XMRig Repository](https://github.com/xmrig/xmrig)
- [XMRig Documentation](https://xmrig.com/docs)
- [Monero Mining Pool List](https://miningpoolstats.stream/monero)