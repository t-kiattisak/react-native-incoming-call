package com.margelo.nitro.incomingcall

import android.app.Application
import android.content.Context
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext

object ContextProvider {
    fun getReactContext(): ReactContext? {
        try {
            val activityThreadClass = Class.forName("android.app.ActivityThread")
            val currentApplicationMethod = activityThreadClass.getDeclaredMethod("currentApplication")
            val application = currentApplicationMethod.invoke(null) as? Application ?: return null
            
            if (application is ReactApplication) {
                // 1. Try ReactHost (New Architecture / Expo 55+)
                try {
                    val reactHost = application.reactHost
                    reactHost?.currentReactContext?.let { return it }
                } catch (ignored: Throwable) {}

                // 2. Try ReactNativeHost (Old Architecture)
                try {
                    val reactNativeHost = application.reactNativeHost
                    val reactContext = reactNativeHost.reactInstanceManager.currentReactContext
                    reactContext?.let { return it }
                } catch (ignored: Throwable) {}
            }
        } catch (e: Exception) {
            android.util.Log.e("ContextProvider", "Error getting ReactContext", e)
        }
        return null
    }

    fun getApplicationContext(): Context? {
        try {
            val activityThreadClass = Class.forName("android.app.ActivityThread")
            val currentApplicationMethod = activityThreadClass.getDeclaredMethod("currentApplication")
            val application = currentApplicationMethod.invoke(null) as? Application
            return application?.applicationContext
        } catch (e: Exception) {
            android.util.Log.e("ContextProvider", "Error getting AppContext", e)
        }
        return null
    }
}
