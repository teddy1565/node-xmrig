// TypeScript definitions for node-xmrig
declare module 'node-xmrig' {
  import { EventEmitter } from 'events';

  // Configuration interfaces
  export interface XMRigConfig {
    cpu?: CpuConfig;
    pool: PoolConfig;
    mining?: MiningConfig;
    log?: LogConfig;
    performance?: PerformanceConfig;
    randomx?: RandomXConfig;
  }

  export interface CpuConfig {
    enabled?: boolean;
    threads?: number;
    cores?: number;
    affinity?: number;
    arith?: number;
    asm?: boolean;
    maxThreads?: number;
  }

  export interface PoolConfig {
    url: string;
    user: string;
    pass?: string;
    algo?: string;
    coin?: string;
    donate?: number;
    nicehash?: boolean;
    ssl?: boolean;
    tls?: boolean;
  }

  export interface MiningConfig {
    enabled?: boolean;
    mode?: 'solo' | 'pool';
    proxy?: number;
    userAgent?: string;
  }

  export interface LogConfig {
    level?: 'trace' | 'debug' | 'info' | 'notice' | 'warning' | 'error';
    file?: string;
    maxSize?: number;
    rotate?: boolean;
  }

  export interface PerformanceConfig {
    idleWait?: number;
    pauseOnBattery?: boolean;
    pauseOnActive?: boolean;
    healthPrintTime?: number;
  }

  export interface RandomXConfig {
    mode?: 'fast' | 'light';
    threads?: number;
    init?: number;
    maxIterations?: number;
    scratchpad?: number;
    numEvictedPages?: number;
  }

  // Event data interfaces
  export interface HashRateInfo {
    rate: number;
    total: number;
    highest: number;
    unit: string;
  }

  export interface ShareInfo {
    accepted: boolean;
    id?: number;
    total: number;
    rejected: number;
  }

  export interface ConnectionInfo {
    pool: string;
    connected: boolean;
    timestamp: number;
  }

  export interface StatusInfo {
    running: boolean;
    hashRate: number;
    uptime: number;
    shares: {
      accepted: number;
      rejected: number;
    };
  }

  export interface StoppedInfo {
    code: number;
    signal: string;
    uptime: number;
  }

  export interface StartedInfo {
    pid: number;
    args: string[];
  }

  // Stats interface
  export interface XMRigStats {
    hashRate: number;
    acceptedShares: number;
    rejectedShares: number;
    totalHashes: number;
    uptime: number;
    running: boolean;
    startTime?: number;
  }

  // Status interface
  export interface XMRigStatus {
    running: boolean;
    configured: boolean;
    threads: number;
    pool: string;
    wallet: string | null;
    version: string;
  }

  // Event names
  export type XMRigEvents = 
    | 'hash'
    | 'share'
    | 'error'
    | 'log'
    | 'status'
    | 'connection'
    | 'started'
    | 'stopped';

  // Main XMRig class
  export class XMRig extends EventEmitter {
    constructor(config?: XMRigConfig);
    
    // Control methods
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    destroy(): void;
    
    // Information methods
    getStats(): XMRigStats;
    getStatus(): XMRigStatus;
    
    // Configuration methods
    updateConfig(config: Partial<XMRigConfig>): void;
    
    // Event emitters
    on(event: 'hash', listener: (data: HashRateInfo) => void): this;
    on(event: 'share', listener: (data: ShareInfo) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'log', listener: (message: string) => void): this;
    on(event: 'status', listener: (data: StatusInfo) => void): this;
    on(event: 'connection', listener: (data: ConnectionInfo) => void): this;
    on(event: 'started', listener: (data: StartedInfo) => void): this;
    on(event: 'stopped', listener: (data: StoppedInfo) => void): this;
    
    // Generic event emitter
    on(event: XMRigEvents, listener: (...args: any[]) => void): this;
  }

  // Utility functions
  export interface PoolInfo {
    name: string;
    url: string;
    algo: string;
    ssl: boolean;
    region: string;
  }

  // Main module exports
  export function createMiner(config?: XMRigConfig): XMRig;
  export function getVersion(): string;
  export function getSupportedAlgorithms(): string[];
  export function getRecommendedPools(): PoolInfo[];

  // Default export
  export default XMRig;
}