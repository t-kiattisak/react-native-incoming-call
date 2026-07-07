package com.margelo.nitro.incomingcall

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider

class IncomingCallPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        IncomingCallModule.reactContext = reactContext
        return null
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        IncomingCallModule.reactContext = reactContext
        return emptyList()
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    companion object {
        init {
            System.loadLibrary("incomingcall")
        }
    }
}
