# XMRig Configuration Interface

## TypeScript Definitions for node-xmrig

### Configuration Options

```typescript
interface XMRigConfig {
  // CPU Configuration
  cpu?: {
    enabled?: boolean;
    cores?: number; // Number of CPU cores to use
    threads?: number; // Same as cores, more intuitive
    affinity?: number; // CPU affinity mask
    arith?: number; // Arithmetic optimization
    asm?: boolean; // Assembly optimizations
    max-threads?: number; // Maximum threads
  };
  
  // Pool Configuration
  pool?: {
    url: string; // Mining pool URL (e.g., "pool.xmr-stak.com:443")
    user: string; // Wallet address
    pass?: string; // Pool password (usually "x" or empty)
    algo?: string; // Mining algorithm (default: "rx/0")
    coin?: string; // Coin to mine instead of algorithm
    donate?: number; // Donation level (0-100)
    nicehash?: boolean; // Enable NiceHash support
    ssl?: boolean; // Enable SSL
    tls?: boolean; // Enable TLS
  };
  
  // Mining Configuration
  mining?: {
    enabled?: boolean;
    mode?: 'solo' | 'pool';
    proxy?: number; // Proxy port
    userAgent?: string;
  };
  
  // Logging Configuration
  log?: {
    level?: 'trace' | 'debug' | 'info' | 'notice' | 'warning' | 'error';
    file?: string; // Log file path
    maxSize?: number; // Maximum log file size in MB
    rotate?: boolean; // Enable log rotation
  };
  
  // Performance Configuration
  performance?: {
    idleWait?: number; // Idle wait time in ms
    pauseOnBattery?: boolean; // Pause mining on battery
    pauseOnActive?: boolean; // Pause mining when active
    healthPrintTime?: number; // Health print interval in seconds
  };
  
  // RandomX Configuration
  randomx?: {
    mode?: 'fast' | 'light';
    threads?: number; // RandomX threads
    init?: number; // Initialization time in seconds
    maxIterations?: number; // Maximum iterations
    scratchpad?: number; // Scratchpad memory in MB
    numEvictedPages?: number; // Number of evicted pages
  };
}
```

### Event Types

```typescript
interface XMRigEvents {
  'hash': (hashRate: HashRate) => void;
  'share': (share: ShareInfo) => void;
  'error': (error: Error) => void;
  'log': (logMessage: string) => void;
  'status': (status: StatusInfo) => void;
  'connection': (pool: string, connected: boolean) => void;
}

interface HashRate {
  total: number; // Total hash rate in H/s
  highest: number; // Highest hash rate in H/s
  threads: number[]; // Hash rate per thread
}

interface ShareInfo {
  accepted: boolean; // Share was accepted
  diff: number; // Share difficulty
  time: number; // Time taken in seconds
  roundTime: number; // Round time in seconds
  pool: string; // Pool URL
}

interface StatusInfo {
  version: string;
  cpu: string;
  threads: number;
  hashRate: number;
  connections: number;
  uptime: number;
}
```

### Usage Examples

```typescript
import { XMRig } from 'node-xmrig';

// Basic usage
const miner = new XMRig({
  cpu: {
    threads: 4, // Use 4 CPU cores
  },
  pool: {
    url: 'pool.xmr-stak.com:4444',
    user: '4A6x4a4R4...your_wallet_address',
    pass: 'x'
  }
});

// Start mining
miner.start();

// Stop mining
miner.stop();

// Event listeners
miner.on('hash', (hashRate) => {
  console.log(`Hash rate: ${hashRate.total} H/s`);
});

miner.on('share', (share) => {
  if (share.accepted) {
    console.log(`Share accepted! Difficulty: ${share.diff}`);
  }
});

// Advanced configuration
const miner2 = new XMRig({
  cpu: {
    cores: 8,
    affinity: 0xFF, // Use cores 0-7
    asm: true, // Enable assembly optimizations
  },
  pool: {
    url: 'mine.c3pool.com:17777',
    user: '4A6x4a4R4...your_wallet_address',
    pass: 'x',
    ssl: true, // Enable SSL
  },
  randomx: {
    mode: 'fast',
    threads: 4,
    init: 5000, // 5 seconds init time
  },
  log: {
    level: 'info',
    file: 'xmrig.log'
  }
});

// Statistics
const stats = miner.getStats();
console.log(`Total hash rate: ${stats.hashRate} H/s`);
console.log(`Uptime: ${stats.uptime} seconds`);

// Destroy when done
miner.destroy();
```