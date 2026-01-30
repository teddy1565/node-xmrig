{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index_node_api.cc"
            ],
            "include_dirs": [
                "node_modules/node-addon-api"
            ],
            "defines": [
                "XMRIG_MINER_PROJECT",
                "XMRIG_ALGO_RANDOMX",
                "NAPI_VERSION=8"
            ],
            "conditions": [
                # macOS configuration
                ['OS=="mac"', {
                    "cflags": [ "-fPIC", "-O3", "-std=c++14" ],
                    "xcode_settings": {
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                        "CLANG_CXX_LIBRARY": "libc++",
                        "MACOSX_DEPLOYMENT_TARGET": "10.12"
                    },
                    "libraries": [ "-lpthread", "-ldl" ]
                }],
                # Linux configuration  
                ['OS=="linux"', {
                    "cflags": [ "-fPIC", "-O3", "-std=c++14" ],
                    "ldflags": [ "-lpthread", "-ldl", "-lrt" ]
                }],
                # Windows configuration
                ['OS=="win"', {
                    "libraries": [
                        "-lkernel32.lib",
                        "-luser32.lib"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1,
                            "AdditionalOptions": [ "/FS" ]
                        },
                        "VCLinkerTool": {
                            "GenerateDebugInformation": "true"
                        }
                    },
                    "defines": [
                        "WINVER=0x0A00",
                        "_WIN32_WINNT=0x0A00"
                    ]
                }]
            ]
        }
    ]
}