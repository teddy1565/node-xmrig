{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index_node_api.cc",
                # Essential XMRig core files for faster compilation
                "src/App.cpp",
                "src/Base.cpp", 
                "src/Summary.cpp",
                "src/base/kernel/Process.cpp",
                "src/base/kernel/Entry.cpp",
                "src/core/config/Config.cpp",
                "src/core/config/ConfigTransform.cpp",
                "src/core/config/Usage.cpp",
                # RandomX crypto (essential for Monero mining)
                "src/crypto/randomx/randomx.cpp",
                "src/crypto/randomx/jit_compiler_x86.cpp", 
                "src/crypto/randomx/vm_interpreted.cpp",
                "src/crypto/randomx/vm_compiled.cpp"
            ],
            "include_dirs": [
                '<!(node -p "require(\'node-addon-api\').include_dir")',
                '<!(node -e "require(\'nan\')")',
                "<(module_root_dir)/src"
            ],
            "defines": [
                "XMRIG_MINER_PROJECT",
                "XMRIG_ALGO_RANDOMX", 
                "NAPI_VERSION=10",
                # Platform-specific defines
                "NODE_ADDON_API_CPP_EXCEPTIONS"
            ],
            "dependencies": [
                "node-addon-api"
            ],
            "cflags!": [ '-fno-exceptions' ],
            "cflags_cc!": [ '-fno-exceptions' ],
            "conditions": [
                # macOS configuration
                ['OS=="mac"', {
                    "cflags": [ "-fPIC", "-O3", "-std=c++17" ],
                    "xcode_settings": {
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                        "CLANG_CXX_LIBRARY": "libc++",
                        "MACOSX_DEPLOYMENT_TARGET": "10.15",
                        "CLANG_CXX_LANGUAGE_STANDARD": "c++17"
                    },
                    "libraries": [ "-lpthread", "-ldl" ]
                }],
                # Linux configuration  
                ['OS=="linux"', {
                    "cflags": [ "-fPIC", "-O3", "-std=c++17" ],
                    "ldflags": [ "-lpthread", "-ldl", "-lrt" ]
                }],
                # Windows configuration
                ['OS=="win"', {
                    "libraries": [
                        "-lcomctl32.lib",
                        "-lshcore.lib", 
                        "-lkernel32.lib",
                        "-luser32.lib",
                        "-lwindowsapp.lib",
                        # Additional Windows libraries if needed
                        "-liphlpapi.lib",
                        "-lversion.lib"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1,
                            "DebugInformationFormat": "OldStyle",
                            "AdditionalOptions": [ "/FS" ],
                            "AdditionalIncludeDirectories": [ "<(module_root_dir)/src" ]
                        },
                        "VCLinkerTool": {
                            "GenerateDebugInformation": "true",
                            "AdditionalDependencies": [
                                "comctl32.lib",
                                "kernel32.lib",
                                "user32.lib"
                            ]
                        }
                    },
                    "defines": [
                        "NODE_ADDON_API_CPP_EXCEPTIONS",
                        "WINVER=0x0A00",
                        "_WIN32_WINNT=0x0A00"
                    ]
                }]
            ]
        }
    ]
}