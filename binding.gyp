{
    "targets": [
        {
            "target_name": "XMRig",
            "sources": [
                "index.cc"
            ]
            ,"include_dirs": [
                "include", "./lib/xmrig/src",
                "lib"
            ],
            # "libraries": [
            #     "-L ./lib/xmrig/build/release/lib -lxmrig"
            # ],
            # "cflags!": [
            #     "-fno-exceptions",
            #     "-fno-rtti"
            # ],
            # "cflags": [
            #     "-std=c++11",
            #     "-fPIC",
            #     "-O3",
            #     "-DNDEBUG"
            # ]
        }
    ]
}