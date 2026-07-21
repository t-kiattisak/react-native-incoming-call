import Foundation
import UIKit

class IncomingCall: HybridIncomingCallSpec {
  public func displayNotification(
    uuid: String,
    avatar: Variant_NullType_String?,
    timeout: Double,
    foregroundOptions: ForegroundOptions
  ) throws {
    _ = avatar

    let payloadJson = encodePayload(foregroundOptions.payload)
    switch IncomingCallPayloadValidator.validateJsShow(
      uuid: uuid,
      title: foregroundOptions.notificationTitle,
      payloadJson: payloadJson
    ) {
    case .failure(let error):
      NSLog("[IncomingCall] displayNotification validation failed: %@", String(describing: error))
      return
    case .success(let validated):
      let (parsedUuid, title, payload) = validated
      let isVideo = foregroundOptions.isVideo ?? false
      let timeoutMs = timeout > 0 ? Int(timeout) : 0

      CallKitManager.shared.reportIncomingCall(
        uuid: parsedUuid,
        title: title,
        body: foregroundOptions.notificationBody,
        isVideo: isVideo,
        payloadJson: payload,
        timeoutMs: timeoutMs,
        sourceIsPush: false
      )
    }
  }

  public func hideNotification() throws {
    CallKitManager.shared.endAllIncomingCalls()
  }

  public func backToApp() throws {
    DispatchQueue.main.async {
      guard let url = URL(string: "\(self.bundleIdentifier())://incoming-call") else {
        return
      }
      UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
  }

  public func registerVoipPush() throws {
    IncomingCallPushKit.shared.registerForVoipPush()
  }

  public func unregisterVoipPush() throws {
    IncomingCallPushKit.shared.unregisterForVoipPush()
  }

  private func bundleIdentifier() -> String {
    Bundle.main.bundleIdentifier ?? ""
  }

  private func encodePayload(_ payload: [String: String]?) -> String? {
    guard let payload, !payload.isEmpty else { return nil }
    guard let data = try? JSONSerialization.data(withJSONObject: payload),
          let json = String(data: data, encoding: .utf8) else {
      return nil
    }
    return json
  }
}
