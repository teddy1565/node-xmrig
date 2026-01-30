{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index_node_api.cc"
            ],
            "include_dirs": [
                "<!@(node -p \"require.resolve('node-addon-api').replace('index.js', '')\")"
            ],
            "defines": [
                "NAPI_VERSION=8"
            ],
            "conditions": [
                # macOS configuration
                ['OS=="mac"', {
                    "cflags": [ "-fPIC", "-O2", "-std=c++14" ],
                    "xcode_settings": {
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                        "CLANG_CXX_LIBRARY": "libc++",
                        "MACOSX_DEPLOYMENT_TARGET": "10.15"
                    },
                    "libraries": []
                }],
                # Linux configuration  
                ['OS=="linux"', {
                    "cflags": [ "-fPIC", "-O2", "-std=c++14" ],
                    "ldflags": [ "-pthread", "-ldl" ]
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