package com.margelo.nitro.incomingcall
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class IncomingCall : HybridIncomingCallSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
