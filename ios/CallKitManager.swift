import CallKit
import Foundation
import UIKit

@objc final class CallKitManager: NSObject, CXProviderDelegate {
  static let shared = CallKitManager()

  private static let maxSessions = 4
  private static let endActionRejected = "ACTION_REJECTED_CALL"
  private static let endActionHide = "ACTION_HIDE_CALL"

  private struct CallSession {
    let uuid: UUID
    var payloadJson: String?
    var timeoutTimer: DispatchSourceTimer?
    var isIncoming: Bool
  }

  private let callController = CXCallController()
  private var provider: CXProvider?
  private var sessions: [UUID: CallSession] = [:]
  private var pendingEndActions: [UUID: String] = [:]
  private var suppressEndEventsForUUIDs = Set<UUID>()
  /// UUIDs we reported to CallKit — used to end orphaned system calls if session map desyncs.
  private var knownCallUUIDs = Set<UUID>()
  private let sessionLock = NSLock()

  private override init() {
    super.init()
  }

  private func runOnMain(_ block: @escaping () -> Void) {
    if Thread.isMainThread {
      block()
    } else {
      DispatchQueue.main.async(execute: block)
    }
  }

  private func configureProviderIfNeeded() {
    assert(Thread.isMainThread, "CallKit CXProvider must be configured on the main thread")
    guard provider == nil else { return }

    let displayName =
      (Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String)
      ?? (Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String)
      ?? "Incoming Call"

    let config: CXProviderConfiguration
    if #available(iOS 14.0, *) {
      config = CXProviderConfiguration()
    } else {
      config = CXProviderConfiguration(localizedName: displayName)
    }
    config.supportsVideo = true
    config.maximumCallsPerCallGroup = Self.maxSessions
    config.maximumCallGroups = Self.maxSessions
    config.includesCallsInRecents = false

    if let iconImage = UIImage(named: "AppIcon"),
       let data = iconImage.pngData() {
      config.iconTemplateImageData = data
    }

    let newProvider = CXProvider(configuration: config)
    newProvider.setDelegate(self, queue: nil)
    provider = newProvider
  }

  func reportIncomingCall(
    uuid: UUID,
    title: String,
    body: String?,
    isVideo: Bool,
    payloadJson: String?,
    timeoutMs: Int,
    sourceIsPush: Bool,
    completion: (() -> Void)? = nil
  ) {
    sessionLock.lock()
    if sessions[uuid] != nil {
      sessionLock.unlock()
      #if DEBUG
        NSLog("[IncomingCall] Ignoring duplicate incoming UUID")
      #endif
      completion?()
      return
    }
    if sessions.count >= Self.maxSessions {
      sessionLock.unlock()
      NSLog("[IncomingCall] Session cap reached (%d)", Self.maxSessions)
      completion?()
      return
    }
    sessionLock.unlock()

    let update = CXCallUpdate()
    update.localizedCallerName = title
    update.remoteHandle = CXHandle(type: .generic, value: title)
    update.hasVideo = isVideo

    let reportBlock = { [weak self] in
      guard let self else {
        completion?()
        return
      }
      self.configureProviderIfNeeded()
      guard let provider = self.provider else {
        NSLog("[IncomingCall] CXProvider is nil after configuration")
        completion?()
        return
      }
      provider.reportNewIncomingCall(with: uuid, update: update) { error in
        defer { completion?() }
        if let error {
          NSLog(
            "[IncomingCall] reportNewIncomingCall failed: %@",
            error.localizedDescription
          )
          return
        }
        self.sessionLock.lock()
        let session = CallSession(
          uuid: uuid,
          payloadJson: payloadJson,
          timeoutTimer: nil,
          isIncoming: true
        )
        self.sessions[uuid] = session
        self.knownCallUUIDs.insert(uuid)
        self.sessionLock.unlock()

        if timeoutMs > 0 {
          self.scheduleTimeout(for: uuid, timeoutMs: timeoutMs)
        }

        _ = body
        _ = sourceIsPush
      }
    }

    runOnMain(reportBlock)
  }

  func endAllIncomingCalls() {
    endAllTrackedCalls(endAction: Self.endActionHide, suppressEvents: false)
  }

  /// Ends every call this module tracked in CallKit (incoming or after answer).
  private func endAllTrackedCalls(endAction: String, suppressEvents: Bool) {
    sessionLock.lock()
    let uuids = knownCallUUIDs.union(Set(sessions.keys))
    if suppressEvents {
      suppressEndEventsForUUIDs.formUnion(uuids)
    }
    for uuid in uuids {
      if var session = sessions[uuid] {
        session.timeoutTimer?.cancel()
        sessions[uuid] = session
      }
    }
    sessions.removeAll()
    sessionLock.unlock()

    for uuid in uuids {
      requestEndCallTransaction(uuid: uuid, endAction: endAction)
    }
  }

  func endCall(uuid: UUID, endAction: String) {
    requestEndCallTransaction(uuid: uuid, endAction: endAction)
  }

  private func requestEndCallTransaction(uuid: UUID, endAction: String) {
    cancelTimeout(for: uuid)

    sessionLock.lock()
    pendingEndActions[uuid] = endAction
    sessionLock.unlock()

    let action = CXEndCallAction(call: uuid)
    let transaction = CXTransaction(action: action)
    callController.request(transaction) { error in
      if let error {
        NSLog("[IncomingCall] endCall failed: %@", error.localizedDescription)
      }
    }
  }

  private func scheduleTimeout(for uuid: UUID, timeoutMs: Int) {
    let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
    timer.schedule(deadline: .now() + .milliseconds(timeoutMs))
    timer.setEventHandler { [weak self] in
      self?.handleTimeout(for: uuid)
    }
    timer.resume()

    sessionLock.lock()
    if var session = sessions[uuid] {
      session.timeoutTimer?.cancel()
      session.timeoutTimer = timer
      sessions[uuid] = session
    }
    sessionLock.unlock()
  }

  private func handleTimeout(for uuid: UUID) {
    sessionLock.lock()
    let session = sessions[uuid]
    sessionLock.unlock()
    guard session?.isIncoming == true else { return }
    endCall(uuid: uuid, endAction: Self.endActionHide)
  }

  private func cancelTimeout(for uuid: UUID) {
    sessionLock.lock()
    if var session = sessions[uuid] {
      session.timeoutTimer?.cancel()
      session.timeoutTimer = nil
      sessions[uuid] = session
    }
    sessionLock.unlock()
  }

  private func removeSession(uuid: UUID) {
    sessionLock.lock()
    if let session = sessions[uuid] {
      session.timeoutTimer?.cancel()
    }
    sessions.removeValue(forKey: uuid)
    knownCallUUIDs.remove(uuid)
    sessionLock.unlock()
  }

  // MARK: - CXProviderDelegate

  func providerDidReset(_ provider: CXProvider) {
    sessionLock.lock()
    for session in sessions.values {
      session.timeoutTimer?.cancel()
    }
    sessions.removeAll()
    knownCallUUIDs.removeAll()
    suppressEndEventsForUUIDs.removeAll()
    sessionLock.unlock()
  }

  /// When the user answers one call, end other tracked calls (stacked incoming / waiting).
  private func endAllCallsExcept(_ keepUUID: UUID, endAction: String) {
    sessionLock.lock()
    let others = knownCallUUIDs.subtracting([keepUUID])
    sessionLock.unlock()
    for uuid in others {
      requestEndCallTransaction(uuid: uuid, endAction: endAction)
    }
  }

  func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    sessionLock.lock()
    let payload = sessions[action.callUUID]?.payloadJson
    if var session = sessions[action.callUUID] {
      session.isIncoming = false
      sessions[action.callUUID] = session
    }
    sessionLock.unlock()

    cancelTimeout(for: action.callUUID)
    action.fulfill()

    endAllCallsExcept(action.callUUID, endAction: Self.endActionRejected)

    IncomingCallEventEmitter.emitAnswer(
      withCallUUID: action.callUUID.uuidString,
      payload: payload
    )
  }

  func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
    sessionLock.lock()
    let payload = sessions[action.callUUID]?.payloadJson
    let endAction =
      pendingEndActions.removeValue(forKey: action.callUUID) ?? Self.endActionRejected
    let suppressEvent = suppressEndEventsForUUIDs.remove(action.callUUID) != nil
    sessionLock.unlock()

    cancelTimeout(for: action.callUUID)
    action.fulfill()
    removeSession(uuid: action.callUUID)

    if suppressEvent {
      return
    }

    IncomingCallEventEmitter.emitEndCall(
      withCallUUID: action.callUUID.uuidString,
      payload: payload,
      endAction: endAction
    )
  }

  func provider(_ provider: CXProvider, perform action: CXSetMutedCallAction) {
    action.fulfill()
  }
}
