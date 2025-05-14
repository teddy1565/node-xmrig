{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index.cc",
                "src/App.cpp",
                "src/core/config/Config.cpp",
                "src/core/config/ConfigTransform.cpp",
                "src/core/Controller.cpp",
                "src/core/Miner.cpp",
                "src/core/Taskbar.cpp",
                "src/net/JobResults.cpp",
                "src/net/Network.cpp",
                "src/net/strategies/DonateStrategy.cpp",
                "src/Summary.cpp",
                
                "src/crypto/cn/c_blake256.c",
                "src/crypto/cn/c_groestl.c",
                "src/crypto/cn/c_jh.c",
                "src/crypto/cn/c_skein.c",
                "src/crypto/cn/CnCtx.cpp",
                "src/crypto/cn/CnHash.cpp",

                "src/crypto/common/Assembly.cpp",
                "src/crypto/common/LinuxMemory.cpp",
                "src/crypto/common/HugePagesInfo.cpp",
                "src/crypto/common/MemoryPool.cpp",
                "src/crypto/common/Nonce.cpp",
                "src/crypto/common/NUMAMemoryPool.cpp",
                "src/crypto/common/VirtualMemory.cpp",
                "src/crypto/common/VirtualMemory_unix.cpp",
                "src/crypto/common/VirtualMemory_win.cpp",
                "src/crypto/common/VirtualMemory_hwloc.cpp",

                "src/crypto/rx/Profiler.cpp",
                "src/crypto/rx/Rx.cpp",
                "src/crypto/rx/RxAlgo.cpp",
                "src/crypto/rx/RxBasicStorage.cpp",
                "src/crypto/rx/RxCache.cpp",
                "src/crypto/rx/RxConfig.cpp",
                "src/crypto/rx/RxDataset.cpp",
                "src/crypto/rx/RxFix_linux.cpp",
                "src/crypto/rx/RxFix_win.cpp",
                "src/crypto/rx/RxMsr.cpp",
                "src/crypto/rx/RxNUMAStorage.cpp",
                "src/crypto/rx/RxQueue.cpp",
                "src/crypto/rx/RxVm.cpp",


                "src/base/io/log/Tags.cpp",
                "src/base/io/log/Log.cpp",
                "src/base/io/log/FileLogWriter.cpp",
                

                "src/backend/cpu/Cpu.cpp",
                "src/backend/cpu/CpuBackend.cpp",
                "src/backend/cpu/CpuConfig.cpp",
                "src/backend/cpu/CpuLaunchData.cpp",
                "src/backend/cpu/CpuThread.cpp",
                "src/backend/cpu/CpuThreads.cpp",
                "src/backend/cpu/CpuWorker.cpp",

                "src/3rdparty/hwloc/src/base64.c",
                "src/3rdparty/hwloc/src/bind.c",
                "src/3rdparty/hwloc/src/bitmap.c",
                "src/3rdparty/hwloc/src/components.c",
                "src/3rdparty/hwloc/src/cpukinds.c",
                "src/3rdparty/hwloc/src/diff.c",
                "src/3rdparty/hwloc/src/distances.c",
                "src/3rdparty/hwloc/src/memattrs.c",
                "src/3rdparty/hwloc/src/misc.c",
                "src/3rdparty/hwloc/src/pci-common.c",
                "src/3rdparty/hwloc/src/shmem.c",
                "src/3rdparty/hwloc/src/topology-noos.c",
                "src/3rdparty/hwloc/src/topology-synthetic.c",
                "src/3rdparty/hwloc/src/topology-windows.c",
                "src/3rdparty/hwloc/src/topology-x86.c",
                "src/3rdparty/hwloc/src/topology-xml-nolibxml.c",
                "src/3rdparty/hwloc/src/topology-xml.c",
                "src/3rdparty/hwloc/src/topology.c",
                "src/3rdparty/hwloc/src/traversal.c",
            ],
            "include_dirs": [
                "src",
                "src/3rdparty/hwloc/include",
                "src/3rdparty/hwloc/src/static-components.h",
                "<!@(node -p \"require('node-addon-api').include\")",
                "src/crypto/cn/CryptoNight_x86.h", #X86
                "src/crypto/cn/CryptoNight_arm.h", #ARM
                "src/backend/common/interfaces/IMemoryPool.h",
                "src/backend/cpu/interfaces/ICpuInfo.h",
                "src/backend/cpu/platform/HwlocCpuInfo.h",
                "src/backend/cpu/platform/BasicCpuInfo.h",
                "src/backend/cpu/Cpu.h",
                "src/backend/cpu/CpuBackend.h",
                "src/backend/cpu/CpuConfig.h",
                "src/backend/cpu/CpuLaunchData.h",
                "src/backend/cpu/CpuThread.h",
                "src/backend/cpu/CpuThreads.h",
                "src/backend/cpu/CpuWorker.h",
                "src/crypto/cn/asm/CryptonightR_template.h",
                "src/crypto/cn/c_blake256.h",
                "src/crypto/cn/c_groestl.h",
                "src/crypto/cn/c_jh.h",
                "src/crypto/cn/c_skein.h",
                "src/crypto/cn/CnAlgo.h",
                "src/crypto/cn/CnCtx.h",
                "src/crypto/cn/CnHash.h",
                "src/crypto/cn/CryptoNight_monero.h",
                "src/crypto/cn/CryptoNight_test.h",
                "src/crypto/cn/CryptoNight.h",
                "src/crypto/cn/groestl_tables.h",
                "src/crypto/cn/hash.h",
                "src/crypto/cn/skein_port.h",
                "src/crypto/cn/soft_aes.h",
                "src/crypto/common/HugePagesInfo.h",
                "src/crypto/common/MemoryPool.h",
                "src/crypto/common/Nonce.h",
                "src/crypto/common/portable/mm_malloc.h",
                "src/crypto/common/VirtualMemory.h",
                "src/App.h",
                "src/core/config/Config_default.h",
                "src/core/config/Config_platform.h",
                "src/core/config/Config.h",
                "src/core/config/ConfigTransform.h",
                "src/core/config/usage.h",
                "src/core/Controller.h",
                "src/core/Miner.h",
                "src/core/Taskbar.h",
                "src/net/interfaces/IJobResultListener.h",
                "src/net/JobResult.h",
                "src/net/JobResults.h",
                "src/net/Network.h",
                "src/net/strategies/DonateStrategy.h",
                "src/Summary.h",
                "src/version.h",
                "src/crypto/rx/Profiler.h",
                "src/base/io/log/Tags.h"
            ],
            "defines": [
                "XMRIG_MINER_PROJECT",
                "XMRIG_FEATURE_HWLOC",
                "XMRIG_ALGO_RANDOMX"
            ],
            "conditions": [
                ['OS=="win"', {
                "msvs_settings": {
                "VCCLCompilerTool": {
                    "AdditionalOptions": [
                    # 可能需要設定 C++ 標準，例如 /std:c++17 或 /std:c++20
                    # 如果專案需要，例如 /std:c++20 (如錯誤日誌所示)
                    ],
                    "ExceptionHandling": 1, # 0 代表 No Exception Handling, 1 代表 Yes with SEH Exceptions (/EHa), 2 代表 Yes (/EHsc)
                    "WarningLevel": 3, # /W3
                    "DisableSpecificWarnings": [
                    4351, 4355, 4800, 4251, 4275, 4244, 4267, # 根據您的錯誤日誌
                    ]
                }
                },
                "link_settings": {
                    "libraries": [
                        "-lpowrprof.lib", # 確保連結所有必要的函式庫
                        "-liphlpapi.lib",
                        # "-lsrc/3rdparty/hwloc_x64-windows/lib/hwloc.lib" # <--- 新增此行，如果需要連結 hwloc 函式庫
                    ]
                }
                }]
            ],
            
        }
    ]
}