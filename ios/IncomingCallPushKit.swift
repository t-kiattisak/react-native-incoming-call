import Foundation
import PushKit

@objc final class IncomingCallPushKit: NSObject, PKPushRegistryDelegate {
  static let shared = IncomingCallPushKit()

  private let pushQueue = DispatchQueue(label: "com.incomingcall.pushkit", qos: .userInitiated)
  private var registry: PKPushRegistry?

  private override init() {
    super.init()
  }

  func registerForVoipPush() {
    pushQueue.async { [weak self] in
      guard let self else { return }
      if self.registry != nil {
        return
      }
      let registry = PKPushRegistry(queue: self.pushQueue)
      registry.delegate = self
      registry.desiredPushTypes = [.voIP]
      self.registry = registry
    }
  }

  func unregisterForVoipPush() {
    pushQueue.async { [weak self] in
      guard let self else { return }
      self.registry?.desiredPushTypes = []
      self.registry?.delegate = nil
      self.registry = nil
    }
  }

  // MARK: - PKPushRegistryDelegate

  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    guard type == .voIP else { return }
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    DispatchQueue.main.async {
      IncomingCallEventEmitter.emitVoipToken(token)
    }
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {
    _ = type
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    guard type == .voIP else {
      completion()
      return
    }

    let dictionary = payload.dictionaryPayload
    let result = IncomingCallPayloadValidator.validatePushPayload(dictionary)

    switch result {
    case .failure:
      #if DEBUG
        NSLog("[IncomingCall] Invalid VoIP push payload")
      #endif
      completion()
      return
    case .success(let validated):
      CallKitManager.shared.reportIncomingCall(
        uuid: validated.uuid,
        title: validated.title,
        body: validated.body,
        isVideo: validated.isVideo,
        payloadJson: validated.payloadJson,
        timeoutMs: validated.timeoutMs,
        sourceIsPush: true
      )
      completion()
    }
  }
}
