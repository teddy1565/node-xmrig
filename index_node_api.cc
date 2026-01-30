#include <napi.h>
#include <iostream>
#include <cstring>
#include <vector>
#include <string>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

// Configuration structure
struct XMRigConfig {
    int threads;
    std::string wallet;
    std::string pool;
    std::string password;
    std::string algo;
};

// Parse configuration from JavaScript with extensive null checking
XMRigConfig parseConfig(const Napi::Object& config) {
    XMRigConfig cfg = {4, "", "", "", "rx/0"}; // Default values
    
    // Safely extract CPU config
    try {
        if (config.Has("cpu") && !config.Get("cpu").IsNull()) {
            Napi::Object cpu = config.Get("cpu").As<Napi::Object>();
            if (cpu.Has("threads") && !cpu.Get("threads").IsNull() && !cpu.Get("threads").IsUndefined()) {
                Napi::Value threadsVal = cpu.Get("threads");
                if (threadsVal.IsNumber()) {
                    cfg.threads = threadsVal.As<Napi::Number>().Int32Value();
                }
            }
        }
    } catch (...) {
        // If CPU extraction fails, use default
        cfg.threads = 4;
    }
    
    // Safely extract pool config
    try {
        if (config.Has("pool") && !config.Get("pool").IsNull()) {
            Napi::Object pool = config.Get("pool").As<Napi::Object>();
            
            // Extract URL
            if (pool.Has("url") && !pool.Get("url").IsNull() && !pool.Get("url").IsUndefined()) {
                Napi::Value urlVal = pool.Get("url");
                if (urlVal.IsString()) {
                    cfg.pool = urlVal.As<Napi::String>().Utf8Value();
                }
            }
            
            // Extract user
            if (pool.Has("user") && !pool.Get("user").IsNull() && !pool.Get("user").IsUndefined()) {
                Napi::Value userVal = pool.Get("user");
                if (userVal.IsString()) {
                    cfg.wallet = userVal.As<Napi::String>().Utf8Value();
                }
            }
            
            // Extract pass
            if (pool.Has("pass") && !pool.Get("pass").IsNull() && !pool.Get("pass").IsUndefined()) {
                Napi::Value passVal = pool.Get("pass");
                if (passVal.IsString()) {
                    cfg.password = passVal.As<Napi::String>().Utf8Value();
                }
            }
        }
    } catch (...) {
        // If pool extraction fails, leave defaults
    }
    
    // Ensure default values and validation
    if (cfg.threads <= 0 || cfg.threads > 32) {
        cfg.threads = 4;
    }
    if (cfg.pool.empty()) {
        cfg.pool = "pool.supportxmr.com:5555";
    }
    if (cfg.password.empty()) {
        cfg.password = "x";
    }
    if (cfg.algo.empty()) {
        cfg.algo = "rx/0";
    }
    
    return cfg;
}

// Build command line arguments from config
std::vector<std::string> buildArgs(const XMRigConfig& cfg) {
    std::vector<std::string> args;
    args.push_back("xmrig");
    
    // Pool configuration - ensure valid pool
    if (!cfg.pool.empty() && cfg.pool != "pool.supportxmr.com:5555") {
        args.push_back("-o");
        args.push_back(cfg.pool);
    } else if (!cfg.pool.empty()) {
        args.push_back("-o");
        args.push_back(cfg.pool);
    }
    
    // Wallet configuration - ensure valid wallet
    if (!cfg.wallet.empty() && cfg.wallet.length() > 10) {
        args.push_back("-u");
        args.push_back(cfg.wallet);
    }
    
    // Password configuration - ensure valid password
    if (!cfg.password.empty() && cfg.password != "x") {
        args.push_back("-p");
        args.push_back(cfg.password);
    } else if (!cfg.password.empty()) {
        args.push_back("-p");
        args.push_back(cfg.password);
    }
    
    // Algorithm configuration - ensure valid algorithm
    if (!cfg.algo.empty() && cfg.algo != "rx/0") {
        args.push_back("-a");
        args.push_back(cfg.algo);
    } else if (!cfg.algo.empty()) {
        args.push_back("-a");
        args.push_back(cfg.algo);
    }
    
    // Threads configuration - ensure valid thread count
    if (cfg.threads > 0 && cfg.threads <= 32 && cfg.threads != 0) {
        args.push_back("-t");
        std::string threadStr = std::to_string(static_cast<int>(cfg.threads));
        args.push_back(threadStr);
    }
    
    // Add some default options
    args.push_back("--asm");
    args.push_back("--print-time");
    args.push_back("30");
    
    return args;
}

// Create Miner function
Napi::Value CreateMiner(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsObject()) {
        Napi::TypeError::New(env, "Configuration object is required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        Napi::Object config = info[0].As<Napi::Object>();
        XMRigConfig cfg = parseConfig(config);
        
        // Validate required fields
        if (cfg.pool.empty()) {
            Napi::Error::New(env, "Pool URL is required").ThrowAsJavaScriptException();
            return env.Null();
        }
        
        if (cfg.wallet.empty()) {
            Napi::Error::New(env, "Wallet address is required").ThrowAsJavaScriptException();
            return env.Null();
        }
        
        // Create result object
        Napi::Object result = Napi::Object::New(env);
        result.Set("success", Napi::Boolean::New(env, true));
        result.Set("message", Napi::String::New(env, "XMRig miner configured successfully"));
        result.Set("threads", Napi::Number::New(env, cfg.threads));
        result.Set("pool", Napi::String::New(env, cfg.pool));
        
        return result;
        
    } catch (const std::exception& e) {
        std::string error_msg = "Configuration error: " + std::string(e.what());
        Napi::Error::New(env, error_msg.c_str()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Start Mining function with extensive debugging
Napi::Value StartMiner(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    std::cout << "StartMiner called" << std::endl;
    
    if (info.Length() < 1 || !info[0].IsObject()) {
        std::cout << "Invalid config parameter" << std::endl;
        Napi::TypeError::New(env, "Configuration object is required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::cout << "Getting config object..." << std::endl;
        Napi::Object config = info[0].As<Napi::Object>();
        
        std::cout << "Parsing config..." << std::endl;
        XMRigConfig cfg = parseConfig(config);
        
        std::cout << "Config parsed: threads=" << cfg.threads 
                  << ", pool=" << cfg.pool 
                  << ", wallet=" << cfg.wallet 
                  << ", password=" << cfg.password 
                  << ", algo=" << cfg.algo << std::endl;
        
        // Build arguments with debug
        std::cout << "Building arguments..." << std::endl;
        std::vector<std::string> args_vec = buildArgs(cfg);
        
        std::cout << "Arguments built: " << args_vec.size() << " items" << std::endl;
        
        // Actually start XMRig process
        std::cout << "Starting XMRig with arguments: ";
        for (const auto& arg : args_vec) {
            if (!arg.empty()) {
                std::cout << arg << " ";
            }
        }
        std::cout << std::endl;
        
        // Fork and execute XMRig
        pid_t pid = fork();
        
        if (pid == 0) {
            // Child process - execute xmrig
            std::vector<const char*> argv_vec;
            argv_vec.push_back("xmrig");
            for (const auto& arg : args_vec) {
                argv_vec.push_back(arg.c_str());
            }
            argv_vec.push_back(nullptr);
            
            // Close std streams to detach from terminal
            freopen("/dev/null", "r", stdin);
            freopen("/dev/null", "w", stdout);
            freopen("/dev/null", "w", stderr);
            
            // Execute xmrig
            execvp("xmrig", const_cast<char* const*>(argv_vec.data()));
            
            // If exec fails
            perror("execvp failed");
            exit(1);
            
        } else if (pid > 0) {
            // Parent process - store PID
            std::cout << "XMRig started with PID: " << pid << std::endl;
        } else {
            // Fork failed
            std::cerr << "Failed to fork process" << std::endl;
            Napi::Error::New(env, "Failed to start XMRig process").ThrowAsJavaScriptException();
            return env.Null();
        }
        
        // Create response object
        Napi::Object response = Napi::Object::New(env);
        
        // Set properties with actual process info
        response.Set("started", Napi::Boolean::New(env, pid > 0));
        response.Set("message", Napi::String::New(env, pid > 0 ? "XMRig started successfully" : "Failed to start XMRig"));
        response.Set("pid", Napi::Number::New(env, pid > 0 ? pid : 0));
        
        // Safe argsCount setting
        int32_t count = static_cast<int32_t>(args_vec.size());
        if (count >= 0) {
            response.Set("argsCount", Napi::Number::New(env, count));
        } else {
            response.Set("argsCount", Napi::Number::New(env, 0));
        }
        
        std::cout << "Response created successfully" << std::endl;
        return response;
        
    } catch (const std::exception& e) {
        std::cout << "Exception in StartMiner: " << e.what() << std::endl;
        
        std::string error_msg = "Mining start error: ";
        try {
            error_msg += std::string(e.what());
        } catch (...) {
            error_msg += "Unknown exception";
        }
        
        Napi::Error::New(env, error_msg.c_str()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Stop Mining function
Napi::Value StopMiner(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("stopped", Napi::Boolean::New(env, true));
    result.Set("message", Napi::String::New(env, "Stop function called"));
    
    return result;
}

// Get Status function
Napi::Value GetStatus(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Napi::Object status = Napi::Object::New(env);
    status.Set("running", Napi::Boolean::New(env, false));
    status.Set("version", Napi::String::New(env, "1.0.0"));
    status.Set("api", Napi::String::New(env, "node-addon-api"));
    
    return status;
}

// Get Version function
Napi::Value GetVersion(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, "1.0.0");
}

// Get Recommended Pools function
Napi::Value GetRecommendedPools(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Napi::Array pools = Napi::Array::New(env);
    
    // Pool 1
    Napi::Object pool1 = Napi::Object::New(env);
    pool1.Set("name", Napi::String::New(env, "SupportXMR"));
    pool1.Set("url", Napi::String::New(env, "pool.supportxmr.com:5555"));
    pool1.Set("region", Napi::String::New(env, "Global"));
    pools.Set(static_cast<uint32_t>(0), pool1);
    
    // Pool 2
    Napi::Object pool2 = Napi::Object::New(env);
    pool2.Set("name", Napi::String::New(env, "MoneroOcean"));
    pool2.Set("url", Napi::String::New(env, "gulf.moneroocean.stream:10128"));
    pool2.Set("region", Napi::String::New(env, "Global"));
    pools.Set(static_cast<uint32_t>(1), pool2);
    
    return pools;
}

// Get Supported Algorithms function
Napi::Value GetSupportedAlgorithms(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    std::vector<std::string> algorithms = {
        "rx/0", "rx/wow", "rx/loki", "rx/vega",
        "cn/r", "cn/fast", "cn/2", "cn/1",
        "cn/gpu"
    };
    
    Napi::Array algos = Napi::Array::New(env);
    for (size_t i = 0; i < algorithms.size(); i++) {
        algos.Set(static_cast<uint32_t>(i), Napi::String::New(env, algorithms[i]));
    }
    
    return algos;
}

// Initialize module
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Add version info
    exports.Set("version", Napi::String::New(env, "1.0.0"));
    exports.Set("api", Napi::String::New(env, "node-addon-api"));
    
    // Export functions
    exports.Set("createMiner", Napi::Function::New(env, CreateMiner));
    exports.Set("start", Napi::Function::New(env, StartMiner));
    exports.Set("stop", Napi::Function::New(env, StopMiner));
    exports.Set("getStatus", Napi::Function::New(env, GetStatus));
    exports.Set("getVersion", Napi::Function::New(env, GetVersion));
    exports.Set("getRecommendedPools", Napi::Function::New(env, GetRecommendedPools));
    exports.Set("getSupportedAlgorithms", Napi::Function::New(env, GetSupportedAlgorithms));
    
    return exports;
}

NODE_API_MODULE(node_xmrig, Init)