// Main module API for node-xmrig
const EventEmitter = require('events');
const { spawn } = require('child_process');

class XMRig extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = this.validateConfig(config);
        this.miner = null;
        this.isRunning = false;
        this.stats = {
            hashRate: 0,
            acceptedShares: 0,
            rejectedShares: 0,
            totalHashes: 0,
            uptime: 0,
            startTime: null
        };
        
        // Default configuration
        this.defaultConfig = {
            cpu: {
                enabled: true,
                threads: null, // Auto detect
                cores: null,   // Alternative to threads
                asm: true,
                affinity: null
            },
            pool: {
                url: null,
                user: null,
                pass: 'x',
                algo: 'rx/0',
                coin: null,
                donate: 1,
                ssl: false,
                tls: false
            },
            mining: {
                enabled: true,
                mode: 'pool',
                proxy: null,
                userAgent: null
            },
            log: {
                level: 'info',
                file: null,
                maxSize: 100,
                rotate: true
            },
            performance: {
                idleWait: 1000,
                pauseOnBattery: false,
                pauseOnActive: false,
                healthPrintTime: 60
            },
            randomx: {
                mode: 'fast',
                threads: null,
                init: 5000,
                maxIterations: 1000000,
                scratchpad: 64,
                numEvictedPages: 1
            }
        };
    }
    
    /**
     * Validate and merge configuration
     */
    validateConfig(config) {
        // Deep merge with defaults
        const mergedConfig = this.deepMerge(this.defaultConfig, config);
        
        // Ensure pool config exists
        if (!mergedConfig.pool) {
            mergedConfig.pool = {};
        }
        
        // Validate required fields
        if (!mergedConfig.pool.url) {
            throw new Error('Pool URL is required');
        }
        
        if (!mergedConfig.pool.user) {
            throw new Error('Pool user (wallet address) is required');
        }
        
        // Ensure cpu config exists
        if (!mergedConfig.cpu) {
            mergedConfig.cpu = {};
        }
        
        // Validate threads/cores configuration
        if (mergedConfig.cpu.threads && mergedConfig.cpu.cores) {
            // Log a warning but don't throw - auto-convert cores to threads
            console.warn('Warning: Both threads and cores specified. Using threads value.');
        }
        
        // Convert cores to threads if specified
        if (mergedConfig.cpu.cores) {
            mergedConfig.cpu.threads = mergedConfig.cpu.cores;
            delete mergedConfig.cpu.cores;
        }
        
        // Auto-detect CPU cores if not specified
        if (!mergedConfig.cpu.threads) {
            mergedConfig.cpu.threads = Math.max(1, Math.floor(require('os').cpus().length * 0.75));
        }
        
        return mergedConfig;
    }
    
    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    /**
     * Build command line arguments from config
     */
    buildArguments() {
        const args = ['node-xmrig'];
        
        // Pool configuration
        if (this.config.pool.url) {
            args.push('-o', this.config.pool.url);
        }
        
        if (this.config.pool.user) {
            args.push('-u', this.config.pool.user);
        }
        
        if (this.config.pool.pass) {
            args.push('-p', this.config.pool.pass);
        }
        
        if (this.config.pool.algo) {
            args.push('-a', this.config.pool.algo);
        }
        
        if (this.config.pool.coin) {
            args.push('--coin', this.config.pool.coin);
        }
        
        if (this.config.pool.donate && this.config.pool.donate !== 1) {
            args.push('--donate-level', this.config.pool.donate.toString());
        }
        
        if (this.config.pool.ssl || this.config.pool.tls) {
            args.push('--tls');
        }
        
        // CPU configuration
        if (this.config.cpu.threads && this.config.cpu.threads > 0) {
            args.push('-t', this.config.cpu.threads.toString());
        }
        
        if (this.config.cpu.asm !== false) {
            args.push('--asm');
        }
        
        if (this.config.cpu.affinity !== null) {
            args.push('--cpu-affinity', this.config.cpu.affinity.toString());
        }
        
        // Mining configuration
        if (this.config.mining.proxy) {
            args.push('--proxy', this.config.mining.proxy.toString());
        }
        
        // Log configuration
        if (this.config.log.level && this.config.log.level !== 'info') {
            args.push('--log-level', this.config.log.level);
        }
        
        if (this.config.log.file) {
            args.push('--log-file', this.config.log.file);
        }
        
        if (this.config.log.maxSize !== 100) {
            args.push('--log-max-size', this.config.log.maxSize.toString());
        }
        
        if (this.config.log.rotate !== true) {
            args.push('--log-no-rotate');
        }
        
        // RandomX configuration
        if (this.config.randomx.mode && this.config.randomx.mode !== 'fast') {
            args.push('--randomx-mode', this.config.randomx.mode);
        }
        
        if (this.config.randomx.threads) {
            args.push('--randomx-threads', this.config.randomx.threads.toString());
        }
        
        if (this.config.randomx.init !== 5000) {
            args.push('--randomx-init', this.config.randomx.init.toString());
        }
        
        if (this.config.randomx.maxIterations !== 1000000) {
            args.push('--randomx-max-iter', this.config.randomx.maxIterations.toString());
        }
        
        if (this.config.randomx.scratchpad !== 64) {
            args.push('--randomx-scratchpad', this.config.randomx.scratchpad.toString());
        }
        
        // Performance configuration
        if (this.config.performance.pauseOnBattery) {
            args.push('--pause-on-battery');
        }
        
        if (this.config.performance.pauseOnActive) {
            args.push('--pause-on-active');
        }
        
        if (this.config.performance.idleWait !== 1000) {
            args.push('--idle-wait', this.config.performance.idleWait.toString());
        }
        
        if (this.config.performance.healthPrintTime !== 60) {
            args.push('--health-print-time', this.config.performance.healthPrintTime.toString());
        }
        
        return args;
    }
    
    /**
     * Start mining
     */
    async start() {
        if (this.isRunning) {
            throw new Error('Miner is already running');
        }
        
        try {
            const args = this.buildArguments();
            this.emit('log', 'Starting XMRig with arguments:', args.join(' '));
            
            // Spawn XMRig process
            this.miner = spawn('./build/Release/XMRig.node', args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            this.isRunning = true;
            this.stats.startTime = Date.now();
            
            // Handle stdout
            this.miner.stdout.on('data', (data) => {
                const output = data.toString();
                this.parseOutput(output);
            });
            
            // Handle stderr
            this.miner.stderr.on('data', (data) => {
                const error = data.toString();
                this.emit('error', new Error(error));
            });
            
            // Handle process exit
            this.miner.on('close', (code, signal) => {
                this.isRunning = false;
                this.stats.uptime = Date.now() - this.stats.startTime;
                
                this.emit('stopped', {
                    code,
                    signal,
                    uptime: this.stats.uptime
                });
            });
            
            this.emit('started', {
                pid: this.miner.pid,
                args: args
            });
            
            return true;
            
        } catch (error) {
            this.isRunning = false;
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Stop mining
     */
    async stop() {
        if (!this.isRunning || !this.miner) {
            return false;
        }
        
        try {
            this.miner.kill('SIGTERM');
            
            // Wait for process to exit
            await new Promise((resolve) => {
                this.miner.on('close', resolve);
            });
            
            this.isRunning = false;
            this.stats.uptime = Date.now() - this.stats.startTime;
            
            this.emit('stopped', {
                code: 0,
                signal: 'SIGTERM',
                uptime: this.stats.uptime
            });
            
            return true;
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Parse XMRig output for statistics
     */
    parseOutput(output) {
        // Parse hash rate
        const hashRateMatch = output.match(/hash rate:\s+(\d+(?:\.\d+)?)\s+([KMG]?H\/s)/);
        if (hashRateMatch) {
            const value = parseFloat(hashRateMatch[1]);
            const unit = hashRateMatch[2];
            
            let hashRate = value;
            if (unit.includes('K')) hashRate *= 1000;
            if (unit.includes('M')) hashRate *= 1000000;
            if (unit.includes('G')) hashRate *= 1000000000;
            
            this.stats.hashRate = hashRate;
            this.emit('hash', {
                rate: hashRate,
                total: hashRate,
                highest: Math.max(hashRate, this.stats.highestHashRate || 0),
                unit: unit
            });
        }
        
        // Parse share information
        const shareMatch = output.match(/share (\d+)\s+\(\d+\)/);
        if (shareMatch) {
            const shareId = parseInt(shareMatch[1]);
            this.stats.acceptedShares++;
            
            this.emit('share', {
                accepted: true,
                id: shareId,
                total: this.stats.acceptedShares,
                rejected: this.stats.rejectedShares
            });
        }
        
        // Parse pool connection
        if (output.includes('connected to')) {
            const poolMatch = output.match(/connected to ([^\s]+)/);
            if (poolMatch) {
                this.emit('connection', {
                    pool: poolMatch[1],
                    connected: true,
                    timestamp: Date.now()
                });
            }
        }
        
        // Parse errors
        if (output.includes('error') || output.includes('ERROR')) {
            this.emit('error', new Error(output.trim()));
        }
        
        // Parse general log messages
        this.emit('log', output.trim());
        
        // Parse status information
        if (output.includes('version:') || output.includes('mining started')) {
            this.emit('status', {
                running: this.isRunning,
                hashRate: this.stats.hashRate,
                uptime: Date.now() - (this.stats.startTime || Date.now()),
                shares: {
                    accepted: this.stats.acceptedShares,
                    rejected: this.stats.rejectedShares
                }
            });
        }
    }
    
    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            running: this.isRunning,
            uptime: this.isRunning ? Date.now() - this.stats.startTime : this.stats.uptime
        };
    }
    
    /**
     * Get current status
     */
    getStatus() {
        return {
            running: this.isRunning,
            configured: !!this.config.pool.url && !!this.config.pool.user,
            threads: this.config.cpu.threads,
            pool: this.config.pool.url,
            wallet: this.config.pool.user ? `${this.config.pool.user.substring(0, 10)}...` : null,
            version: '1.0.0'
        };
    }
    
    /**
     * Update configuration (requires restart)
     */
    updateConfig(newConfig) {
        const wasRunning = this.isRunning;
        
        if (wasRunning) {
            this.stop();
        }
        
        this.config = this.validateConfig(this.deepMerge(this.config, newConfig));
        
        if (wasRunning) {
            this.start();
        }
    }
    
    /**
     * Destroy the miner instance
     */
    destroy() {
        if (this.miner) {
            this.miner.kill('SIGKILL');
            this.miner = null;
        }
        this.removeAllListeners();
    }
}

// Export the module
module.exports = XMRig;