const XMRig = require('./lib/xmrig');

module.exports = {
    XMRig,
    
    // Quick start function for easy usage
    createMiner(config) {
        return new XMRig(config);
    },
    
    // Static methods for utility functions
    getVersion() {
        return '1.0.0';
    },
    
    getSupportedAlgorithms() {
        return [
            'rx/0',      // RandomX (Monero)
            'rx/wow',    // RandomX (Wownero)
            'rx/loki',   // RandomX (Loki)
            'rx/arko',   // RandomX (Arqma)
            'rx/xhv',    // RandomX (Haven)
            'rx/rtm',    // RandomX (Ryo)
            'rx/fast',   // RandomX (Fast mode)
            'rx/lux',    // RandomX (LuxCoin)
            'cn/r',      // CryptoNight-R
            'cn/fast',   // CryptoNight-Fast
            'cn/rto',    // CryptoNight-RTO
            'cn/double', // CryptoNight-Double
            'cn/gpu',    // CryptoNight-GPU
            'cn-lite/1', // CryptoNight-Lite (Monero)
            'cn-lite/v7',// CryptoNight-Lite v7 (IntenseCoin)
            'cn-pico',   // CryptoNight-Pico
            'cn/upx2',   // CryptoNight-Uplexa
            'cn/zls',    // CryptoNight-ZLS
            'cn/2',      // CryptoNight v2
            'cn/1',      // CryptoNight v1
            'cn/0',      // CryptoNight v0
            'cn/half',   // CryptoNight-Half
            'cn/xao',    // CryptoNight-XAO
            'cn/edge',   // CryptoNight-Edge
            'cn/gui',    // CryptoNight-GUI
            'cn/saber',  // CryptoNight-Saber
            'cn/b2n',    // CryptoNight-B2N
            'cn/rwz',    // CryptoNight-RWZ
            'cn/zec',    // CryptoNight-ZEC
            'cn/ccx',    // CryptoNight-CCX
            'hash',      // Keccak
            'hash/rho',  // Keccak-Rho
            'hash/rho2', // Keccak-Rho2
            'hash/modexp', // Keccak-Modexp
            'blake2b',   // Blake2b
            'blake2s',   // Blake2s
            'skein',     // Skein
            'groestl',   // Groestl
            'groestl2',  // Groestl2
            'haval',     // Haval
            'fugue',     // Fugue
            'shabal',    // Shabal
            'whirlpool', // Whirlpool
            'whirlpoolx', // WhirlpoolX
            'keccak',    // Keccak
            'keccakc',   // KeccakC
            'keccak2b',  // Keccak2b
            'quark',     // Quark
            'qubit',     // Qubit
            'pentabar',  // Pentabar
            'yescrypt',  // Yescrypt
            'yescryptR16', // Yescrypt-R16
            'yescryptR32', // Yescrypt-R32
            'yescryptR8'  // Yescrypt-R8
        ];
    },
    
    getRecommendedPools() {
        return [
            {
                name: 'SupportXMR',
                url: 'gulf.moneroocean.stream:10128',
                algo: 'rx/0',
                ssl: true,
                region: 'Global'
            },
            {
                name: 'MinerGate',
                url: 'gulf.moneroocean.stream:10128',
                algo: 'rx/0',
                ssl: true,
                region: 'Global'
            },
            {
                name: 'MoneroOcean',
                url: 'gulf.moneroocean.stream:10128',
                algo: 'rx/0',
                ssl: true,
                region: 'Global'
            },
            {
                name: 'XMRPool.net',
                url: 'pool.xmrpool.net:5555',
                algo: 'rx/0',
                ssl: false,
                region: 'Europe'
            },
            {
                name: 'XMRPool.org',
                url: 'pool.xmrpool.org:9999',
                algo: 'rx/0',
                ssl: false,
                region: 'US'
            }
        ];
    }
};