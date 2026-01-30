#include <node_api.h>
#include <napi.h>
#include <iostream>
#include <cstring>
#include <vector>
#include <string>

// Forward declarations
extern "C" {
    int xmrig_main(int argc, char** argv);
}

// Configuration structure
struct XMRigConfig {
    int threads;
    std::string wallet;
    std::string pool;
    std::string password;
};

// Parse configuration from JavaScript
XMRigConfig parseConfig(const Napi::Object& config) {
    XMRigConfig cfg = {4, "", "", ""}; // Default values
    
    if (config.Has("cpu") && config.Get("cpu").IsObject()) {
        Napi::Object cpu = config.Get("cpu").As<Napi::Object>();
        if (cpu.Has("threads")) {
            Napi::Value threadsVal = cpu.Get("threads");
            if (threadsVal.IsNumber()) {
                cfg.threads = threadsVal.As<Napi::Number>().Int32Value();
            }
        }
    }
    
    if (config.Has("pool") && config.Get("pool").IsObject()) {
        Napi::Object pool = config.Get("pool").As<Napi::Object>();
        if (pool.Has("url")) {
            Napi::Value urlVal = pool.Get("url");
            if (urlVal.IsString()) {
                cfg.pool = urlVal.As<Napi::String>().Utf8Value();
            }
        }
        if (pool.Has("user")) {
            Napi::Value userVal = pool.Get("user");
            if (userVal.IsString()) {
                cfg.wallet = userVal.As<Napi::String>().Utf8Value();
            }
        }
        if (pool.Has("pass")) {
            Napi::Value passVal = pool.Get("pass");
            if (passVal.IsString()) {
                cfg.password = passVal.As<Napi::String>().Utf8Value();
            }
        }
    }
    
    return cfg;
}

// Build command line arguments from config
std::vector<std::string> buildArgs(const XMRigConfig& cfg) {
    std::vector<std::string> args;
    args.push_back("node-xmrig");
    
    if (!cfg.pool.empty()) {
        args.push_back("-o");
        args.push_back(cfg.pool);
    }
    
    if (!cfg.wallet.empty()) {
        args.push_back("-u");
        args.push_back(cfg.wallet);
    }
    
    if (!cfg.password.empty()) {
        args.push_back("-p");
        args.push_back(cfg.password);
    }
    
    if (cfg.threads > 0) {
        args.push_back("-t");
        args.push_back(std::to_string(cfg.threads));
    }
    
    // Add some default options
    args.push_back("--asm");
    
    return args;
}

// Convert vector to char** for XMRig
char** argsToCArray(const std::vector<std::string>& args) {
    char** argv = new char*[args.size()];
    for (size_t i = 0; i < args.size(); ++i) {
        argv[i] = new char[args[i].size() + 1];
        std::strcpy(argv[i], args[i].c_str());
    }
    return argv;
}

// Cleanup allocated memory
void cleanupArgs(char** argv, int argc) {
    for (int i = 0; i < argc; ++i) {
        delete[] argv[i];
    }
    delete[] argv;
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
        
        Napi::Object result = Napi::Object::New(env);
        result.Set("success", Napi::Boolean::New(env, true));
        result.Set("message", Napi::String::New(env, "XMRig miner configured successfully"));
        result.Set("threads", Napi::Number::New(env, cfg.threads));
        result.Set("pool", Napi::String::New(env, cfg.pool));
        
        return result;
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, std::string("Configuration error: ") + e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Start Mining function
Napi::Value StartMiner(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsObject()) {
        Napi::TypeError::New(env, "Configuration object is required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        Napi::Object config = info[0].As<Napi::Object>();
        XMRigConfig cfg = parseConfig(config);
        
        // Build arguments
        std::vector<std::string> args = buildArgs(cfg);
        int argc = static_cast<int>(args.size());
        char** argv = argsToCArray(args);
        
        // Start XMRig (this is blocking)
        std::cout << "Starting XMRig with arguments: ";
        for (const auto& arg : args) {
            std::cout << arg << " ";
        }
        std::cout << std::endl;
        
        // Call the actual XMRig function
        int result = xmrig_main(argc, argv);
        
        // Cleanup
        cleanupArgs(argv, argc);
        
        Napi::Object response = Napi::Object::New(env);
        response.Set("started", Napi::Boolean::New(env, result == 0));
        response.Set("exitCode", Napi::Number::New(env, result));
        
        return response;
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, std::string("Mining start error: ") + e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Stop Mining function (placeholder for now)
Napi::Value StopMiner(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("stopped", Napi::Boolean::New(env, true));
    result.Set("message", Napi::String::New(env, "Stop function called (implementation pending)"));
    
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
    
    return exports;
}

NODE_API_MODULE(node_xmrig, Init)