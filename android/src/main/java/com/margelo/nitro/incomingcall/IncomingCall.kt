package com.margelo.nitro.incomingcall

import android.content.Intent
import android.util.Log
import android.view.WindowManager
import com.facebook.proguard.annotations.DoNotStrip
import org.json.JSONObject

@DoNotStrip
class IncomingCall : HybridIncomingCallSpec() {

    private fun resolveContext(): android.content.Context? {
        val reactContext = ContextProvider.getReactContext()
        if (reactContext != null) {
            IncomingCallModule.reactContext = reactContext as? com.facebook.react.bridge.ReactApplicationContext
        }
        return ContextProvider.getApplicationContext()
    }

    override fun displayNotification(
        uuid: String,
        avatar: Variant_NullType_String?,
        timeout: Double,
        foregroundOptions: ForegroundOptions
    ) {
        Log.d("IncomingCall", "displayNotification ui")
        val context = resolveContext() ?: return
        
        try {
            val avatarStr = avatar?.asSecondOrNull()
            val intent = Intent(context, IncomingCallService::class.java).apply {
                putExtra("uuid", uuid)
                putExtra("name", foregroundOptions.notificationTitle)
                putExtra("avatar", avatarStr)
                putExtra("info", foregroundOptions.notificationBody)
                putExtra("channelId", foregroundOptions.channelId)
                putExtra("channelName", foregroundOptions.channelName)
                putExtra("timeout", timeout.toInt())
                putExtra("icon", foregroundOptions.notificationIcon)
                putExtra("answerText", foregroundOptions.answerText)
                putExtra("declineText", foregroundOptions.declineText)
                putExtra("notificationColor", foregroundOptions.notificationColor)
                putExtra("notificationSound", foregroundOptions.notificationSound)
                putExtra("mainComponent", foregroundOptions.mainComponent)
                
                foregroundOptions.isVideo?.let {
                    putExtra("isVideo", it)
                }
                
                foregroundOptions.payload?.let { payloadMap ->
                    val json = JSONObject()
                    for ((key, value) in payloadMap) {
                        json.put(key, value)
                    }
                    putExtra("payload", json.toString())
                }
                
                action = Constants.ACTION_SHOW_INCOMING_CALL
            }
            context.startService(intent)
        } catch (e: Exception) {
            Log.e("IncomingCall", "Error displayNotification", e)
        }
    }

    override fun hideNotification() {
        if (IncomingCallActivity.active) {
            IncomingCallActivity.getInstance().destroyActivity(false)
        }
        val context = resolveContext() ?: return
        val intent = Intent(context, IncomingCallService::class.java).apply {
            action = Constants.HIDE_NOTIFICATION_INCOMING_CALL
        }
        context.stopService(intent)
    }

    override fun backToApp() {
        val context = resolveContext() ?: return
        val packageName = context.packageName
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName) ?: return
        val focusIntent = launchIntent.cloneFilter()
        
        val reactContext = IncomingCallModule.reactContext
        val activity = reactContext?.currentActivity
        val isOpened = activity != null
        
        if (!isOpened) {
            focusIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
            context.startActivity(focusIntent)
        } else {
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            activity?.startActivity(focusIntent)
        }
    }
}
