{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index_refactored.cc",
                # XMRig core sources - keep essential ones for faster compilation
                "src/App.cpp",
                "src/Base.cpp",
                "src/Summary.cpp",
                "src/base/kernel/Process.cpp",
                "src/base/kernel/Entry.cpp",
                "src/core/config/Config.cpp",
                "src/core/config/ConfigTransform.cpp",
                "src/core/config/Usage.cpp",
                # Crypto (keep RandomX for Monero)
                "src/crypto/randomx/randomx.cpp",
                "src/crypto/randomx/jit_compiler_x86.cpp",
                "src/crypto/randomx/vm_interpreted.cpp",
                "src/crypto/randomx/vm_compiled.cpp"
            ],
            "defines": [
                "XMRIG_MINER_PROJECT",
                "XMRIG_ALGO_RANDOMX",
                # Platform detection
                "XMRIG_OS_WINDOWS=<(OS)",
                "XMRIG_OS_MACOS=<(OS)",
                "XMRIG_64_BIT",
                # Node-API compatibility
                "NAPI_VERSION=10"
            ],
            "include_dirs": [
                "<!(node -p \"require('node-addon-api').include\")"
            ],
            "dependencies": [
                "node-addon-api"
            ],
            # Remove platform-specific libraries that cause issues
            # "libraries": [],
            "cflags!": [ '-fno-exceptions' ],
            "cflags_cc!": [ '-fno-exceptions' ],
            "conditions": [
                ['OS=="mac"', {
                    "cflags": [ "-fPIC", "-O3" ],
                    "xcode_settings": {
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                        "CLANG_CXX_LIBRARY": "libc++",
                        "MACOSX_DEPLOYMENT_TARGET": "10.15"
                    }
                }],
                ['OS=="linux"', {
                    "cflags": [ "-fPIC", "-O3" ],
                    "ldflags": [ "-lpthread", "-ldl" ]
                }],
                ['OS=="win"', {
                    "cflags": [ "/Oy-" ],
                    "ldflags": [ "/nodefaultlib:LIBCMT.lib" ]
                }]
            ]
        }
    ]
}