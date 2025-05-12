#include <node.h>
#include <uv.h>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <node_api.h>

#include "./lib/xmrig/src/App.h"
#include "./lib/xmrig/src/base/kernel/Entry.h"
#include "./lib/xmrig/src/base/kernel/Process.h"




using namespace std;

namespace XMRig {
    using v8::FunctionCallbackInfo;
    using v8::Local;
    using v8::Function;
    using v8::Value;
    using v8::String;
    using v8::Number;
    using v8::Isolate;
    using v8::Context;
    using v8::Object;
    using v8::External;
    using v8::Array;


    char* ToString(const String::Utf8Value& value) {
        return (char*) (*value ? (char*) *value : "<string conversion failed>");
    }

    void StartXmrig(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        int32_t argc = args[0] -> Int32Value(isolate->GetCurrentContext()).ToChecked();
        v8::Local<Array> argv = Local<Array>::Cast(args[1]);
        printf("argc: %d\n", argc);
        char **argvs = (char **) malloc(sizeof(char *) * argc);
        for (int i = 0; i < argv->Length(); i++) {
            v8::String::Utf8Value v8_inputString(isolate, argv->Get(isolate->GetCurrentContext(), i).ToLocalChecked());
            strlen(*v8_inputString);
            argvs[i] = (char *) malloc(sizeof(char) * (strlen(*v8_inputString) + 1));
            strcpy(argvs[i], *v8_inputString);
            printf("argv[%d]: %s\n", i, argvs[i]);
        }
        xmrig::Process process(argc, argvs);
        const xmrig::Entry::Id entry = xmrig::Entry::get(process);
        if (entry) {
            v8::Local<Number> exec_result = Number::New(isolate, xmrig::Entry::exec(process, entry));
            args.GetReturnValue().Set(exec_result);
        } else {
            xmrig::App app(&process);
            v8::Local<Number> exec_result = Number::New(isolate, app.exec());
            args.GetReturnValue().Set(exec_result);
        }
    }

    void Initialize(Local<Object> exports) {
        NODE_SET_METHOD(exports, "start", StartXmrig);
    }

    NODE_MODULE(NODE_MODULE_NAME, Initialize);
}

int main(int argc, char **argv) {
    return 0;
}
