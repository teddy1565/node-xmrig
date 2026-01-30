#include <node.h>
#include <uv.h>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <node_api.h>
#include <napi.h>

#include "./src/App.h"
#include "./src/base/kernel/Entry.h"
#include "./src/base/kernel/Process.h"
#include "./src/core/config/Config.h"
#include "./src/core/config/usage.h"
#include "./src/base/kernel/config/BaseConfig.h"

using namespace std;
using namespace v8;

namespace XMRig {
    
    // Global miner instance to prevent GC
    static xmrig::App* g_miner = nullptr;
    static uv_async_t* g_async = nullptr;
    static std::vector<std::string> g_log_messages;
    static uv_mutex_t g_log_mutex;
    
    // Helper function to convert v8::Value to std::string
    static std::string GetString(const Local<Value>& value) {
        if (value->IsString()) {
            String::Utf8Value utf8_value(value);
            return std::string(*utf8_value);
        }
        return "";
    }
    
    // Helper function to convert v8::Value to uint32_t
    static uint32_t GetUint32(const Local<Value>& value, uint32_t defaultValue = 0) {
        if (value->IsNumber()) {
            return value->Uint32Value(Local<Context>::New(value->CreationContext(), v8::Isolate::GetCurrent()->GetCurrentContext())).ToChecked();
        }
        return defaultValue;
    }
    
    // Helper function to get nested property
    static Local<Value> GetProperty(Local<Object> obj, const char* name) {
        Local<Context> context = obj->GetCreationContext().ToLocalChecked();
        Local<String> prop = String::NewFromUtf8(v8::Isolate::GetCurrent(), name, NewStringType::kNormal).ToLocalChecked();
        return obj->Get(context, prop).ToLocalChecked();
    }
    
    // Create command line arguments from config
    static void BuildCommandLineArgs(const Local<Object>& config, std::vector<std::string>& args) {
        args.push_back("node-xmrig"); // Program name
        
        // Pool configuration
        Local<Value> poolValue = GetProperty(config, "pool");
        if (poolValue->IsObject()) {
            Local<Object> pool = Local<Object>::Cast(poolValue);
            
            // Pool URL
            Local<Value> urlValue = GetProperty(pool, "url");
            if (!GetString(urlValue).empty()) {
                args.push_back("-o");
                args.push_back(GetString(urlValue));
            }
            
            // Pool user (wallet address)
            Local<Value> userValue = GetProperty(pool, "user");
            if (!GetString(userValue).empty()) {
                args.push_back("-u");
                args.push_back(GetString(userValue));
            }
            
            // Pool password
            Local<Value> passValue = GetProperty(pool, "pass");
            if (!GetString(passValue).empty()) {
                args.push_back("-p");
                args.push_back(GetString(passValue));
            }
            
            // Algorithm
            Local<Value> algoValue = GetProperty(pool, "algo");
            if (!GetString(algoValue).empty()) {
                args.push_back("-a");
                args.push_back(GetString(algoValue));
            }
            
            // Coin
            Local<Value> coinValue = GetProperty(pool, "coin");
            if (!GetString(coinValue).empty()) {
                args.push_back("--coin");
                args.push_back(GetString(coinValue));
            }
            
            // SSL/TLS
            Local<Value> sslValue = GetProperty(pool, "ssl");
            if (sslValue->IsBoolean() && sslValue->ToBoolean(v8::Isolate::GetCurrent())->Value()) {
                args.push_back("--tls");
            }
        }
        
        // CPU configuration
        Local<Value> cpuValue = GetProperty(config, "cpu");
        if (cpuValue->IsObject()) {
            Local<Object> cpu = Local<Object>::Cast(cpuValue);
            
            // Threads/Cores
            Local<Value> threadsValue = GetProperty(cpu, "threads");
            if (threadsValue->IsNumber()) {
                uint32_t threads = GetUint32(threadsValue);
                if (threads > 0) {
                    args.push_back("-t");
                    args.push_back(to_string(threads));
                }
            }
            
            // Cores (alternative to threads)
            Local<Value> coresValue = GetProperty(cpu, "cores");
            if (coresValue->IsNumber()) {
                uint32_t cores = GetUint32(coresValue);
                if (cores > 0) {
                    args.push_back("-t");
                    args.push_back(to_string(cores));
                }
            }
            
            // Assembly optimizations
            Local<Value> asmValue = GetProperty(cpu, "asm");
            if (asmValue->IsBoolean() && asmValue->ToBoolean(v8::Isolate::GetCurrent())->Value()) {
                args.push_back("--asm");
            }
            
            // Affinity
            Local<Value> affinityValue = GetProperty(cpu, "affinity");
            if (affinityValue->IsNumber()) {
                uint32_t affinity = GetUint32(affinityValue);
                args.push_back("--cpu-affinity");
                args.push_back(to_string(affinity));
            }
        }
        
        // Mining configuration
        Local<Value> miningValue = GetProperty(config, "mining");
        if (miningValue->IsObject()) {
            Local<Object> mining = Local<Object>::Cast(miningValue);
            
            // Donate level
            Local<Value> donateValue = GetProperty(mining, "donate");
            if (donateValue->IsNumber()) {
                uint32_t donate = GetUint32(donateValue);
                args.push_back("--donate-level");
                args.push_back(to_string(donate));
            }
        }
        
        // Logging configuration
        Local<Value> logValue = GetProperty(config, "log");
        if (logValue->IsObject()) {
            Local<Object> log = Local<Object>::Cast(logValue);
            
            // Log level
            Local<Value> levelValue = GetProperty(log, "level");
            if (!GetString(levelValue).empty()) {
                args.push_back("--log-level");
                args.push_back(GetString(levelValue));
            }
            
            // Log file
            Local<Value> fileValue = GetProperty(log, "file");
            if (!GetString(fileValue).empty()) {
                args.push_back("--log-file");
                args.push_back(GetString(fileValue));
            }
        }
        
        // RandomX configuration
        Local<Value> randomxValue = GetProperty(config, "randomx");
        if (randomxValue->IsObject()) {
            Local<Object> randomx = Local<Object>::Cast(randomxValue);
            
            // RandomX mode
            Local<Value> modeValue = GetProperty(randomx, "mode");
            if (!GetString(modeValue).empty()) {
                if (GetString(modeValue) == "fast") {
                    args.push_back("--randomx-mode");
                    args.push_back("fast");
                } else if (GetString(modeValue) == "light") {
                    args.push_back("--randomx-mode");
                    args.push_back("light");
                }
            }
        }
        
        // Performance configuration
        Local<Value> performanceValue = GetProperty(config, "performance");
        if (performanceValue->IsObject()) {
            Local<Object> performance = Local<Object>::Cast(performanceValue);
            
            // Pause on battery
            Local<Value> batteryValue = GetProperty(performance, "pauseOnBattery");
            if (batteryValue->IsBoolean() && batteryValue->ToBoolean(v8::Isolate::GetCurrent())->Value()) {
                args.push_back("--pause-on-battery");
            }
            
            // Pause on active
            Local<Value> activeValue = GetProperty(performance, "pauseOnActive");
            if (activeValue->IsBoolean() && activeValue->ToBoolean(v8::Isolate::GetCurrent())->Value()) {
                args.push_back("--pause-on-active");
            }
            
            // Idle wait
            Local<Value> idleValue = GetProperty(performance, "idleWait");
            if (idleValue->IsNumber()) {
                uint32_t idleWait = GetUint32(idleValue);
                args.push_back("--idle-wait");
                args.push_back(to_string(idleWait));
            }
        }
    }
    
    // Log callback function for async logging
    static void LogCallback(uv_async_t* handle) {
        if (!g_miner) return;
        
        uv_mutex_lock(&g_log_mutex);
        
        if (!g_log_messages.empty()) {
            // Emit log events here if needed
            std::cout << "XMRig Node.js Module: " << g_log_messages.back() << std::endl;
            g_log_messages.clear();
        }
        
        uv_mutex_unlock(&g_log_mutex);
    }
    
    // Main XMRig constructor
    Napi::Value CreateMiner(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        if (info.Length() < 1 || !info[0].IsObject()) {
            Napi::TypeError::New(env, "Configuration object is required").ThrowAsJavaScriptException();
            return env.Null();
        }
        
        Local<Object> config = Local<Object>::Cast(info[0]);
        
        // Build command line arguments
        std::vector<std::string> args;
        BuildCommandLineArgs(config, args);
        
        // Convert to char**
        int argc = args.size();
        char** argv = new char*[argc];
        for (int i = 0; i < argc; i++) {
            argv[i] = new char[args[i].length() + 1];
            strcpy(argv[i], args[i].c_str());
        }
        
        try {
            // Initialize XMRig
            xmrig::Process process(argc, argv);
            const xmrig::Entry::Id entry = xmrig::Entry::get(process);
            
            if (entry != xmrig::Entry::Default) {
                Napi::Error::New(env, "Invalid configuration provided").ThrowAsJavaScriptException();
                return env.Null();
            }
            
            if (g_miner) {
                delete g_miner;
            }
            
            g_miner = new xmrig::App(&process);
            
            // Initialize async logging
            if (!g_async) {
                uv_mutex_init(&g_log_mutex);
                uv_async_init(uv_default_loop(), g_async, LogCallback);
                uv_unref((uv_handle_t*)g_async);
            }
            
            // Cleanup argv
            for (int i = 0; i < argc; i++) {
                delete[] argv[i];
            }
            delete[] argv;
            
            // Return success
            Napi::Object result = Napi::Object::New(env);
            result.Set("success", Napi::Boolean::New(env, true));
            result.Set("message", Napi::String::New(env, "XMRig miner initialized successfully"));
            
            return result;
            
        } catch (const exception& e) {
            Napi::Error::New(env, std::string("Failed to initialize XMRig: ") + e.what()).ThrowAsJavaScriptException();
            return env.Null();
        }
    }
    
    // Start mining
    Napi::Value StartMiner(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        if (!g_miner) {
            Napi::Error::New(env, "Miner not initialized").ThrowAsJavaScriptException();
            return env.Null();
        }
        
        try {
            // Start the mining process
            int result = g_miner->exec();
            
            Napi::Object response = Napi::Object::New(env);
            response.Set("started", Napi::Boolean::New(env, result == 0));
            response.Set("exitCode", Napi::Number::New(env, result));
            
            return response;
            
        } catch (const exception& e) {
            Napi::Error::New(env, std::string("Failed to start mining: ") + e.what()).ThrowAsJavaScriptException();
            return env.Null();
        }
    }
    
    // Stop mining
    Napi::Value StopMiner(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        if (g_miner) {
            delete g_miner;
            g_miner = nullptr;
        }
        
        Napi::Object result = Napi::Object::New(env);
        result.Set("stopped", Napi::Boolean::New(env, true));
        
        return result;
    }
    
    // Get current status
    Napi::Value GetStatus(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        Napi::Object status = Napi::Object::New(env);
        status.Set("running", Napi::Boolean::New(env, g_miner != nullptr));
        status.Set("version", Napi::String::New(env, "1.0.0"));
        
        return status;
    }
    
    // Get statistics
    Napi::Value GetStats(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        
        Napi::Object stats = Napi::Object::New(env);
        stats.Set("hashRate", Napi::Number::New(env, 0)); // TODO: Implement actual hash rate tracking
        stats.Set("acceptedShares", Napi::Number::New(env, 0)); // TODO: Implement share tracking
        stats.Set("rejectedShares", Napi::Number::New(env, 0)); // TODO: Implement share tracking
        stats.Set("totalHashes", Napi::Number::New(env, 0)); // TODO: Implement hash tracking
        
        return stats;
    }
    
    // Initialize module
    Napi::Object Init(Napi::Env env, Napi::Object exports) {
        exports.Set("createMiner", Napi::Function::New(env, CreateMiner));
        exports.Set("start", Napi::Function::New(env, StartMiner));
        exports.Set("stop", Napi::Function::New(env, StopMiner));
        exports.Set("getStatus", Napi::Function::New(env, GetStatus));
        exports.Set("getStats", Napi::Function::New(env, GetStats));
        
        return exports;
    }
    
    // Cleanup on module unload
    static void Cleanup(void* arg) {
        if (g_miner) {
            delete g_miner;
            g_miner = nullptr;
        }
        
        if (g_async) {
            uv_close((uv_handle_t*)g_async, nullptr);
            g_async = nullptr;
        }
        
        uv_mutex_destroy(&g_log_mutex);
    }
    
    // Module registration
    NODE_API_MODULE(xmrig, Init)
}