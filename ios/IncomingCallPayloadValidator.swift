import Foundation

enum IncomingCallPayloadValidator {
  static let maxTitleLength = 256
  static let maxPayloadJsonLength = 8192
  static let incomingCallType = "incoming_call"

  struct ValidatedIncomingCall {
    let uuid: UUID
    let title: String
    let body: String?
    let timeoutMs: Int
    let isVideo: Bool
    let payloadJson: String?
  }

  enum ValidationError: Error {
    case missingUuid
    case invalidUuid
    case invalidType
    case titleTooLong
    case payloadTooLarge
  }

  static func sanitizeCallerName(_ raw: String) -> String {
    let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    let filtered = trimmed.unicodeScalars.filter { scalar in
      !CharacterSet.controlCharacters.contains(scalar)
    }
    let result = String(String.UnicodeScalarView(filtered))
    if result.count > maxTitleLength {
      return String(result.prefix(maxTitleLength))
    }
    return result.isEmpty ? "Unknown" : result
  }

  static func parseUuid(_ string: String) -> UUID? {
    UUID(uuidString: string.trimmingCharacters(in: .whitespacesAndNewlines))
  }

  static func validatePushPayload(_ dictionary: [AnyHashable: Any]) -> Result<ValidatedIncomingCall, ValidationError> {
    guard let type = stringValue(dictionary["type"]), type == incomingCallType else {
      return .failure(.invalidType)
    }
    guard let uuidString = stringValue(dictionary["uuid"]) else {
      return .failure(.missingUuid)
    }
    guard let uuid = parseUuid(uuidString) else {
      return .failure(.invalidUuid)
    }

    let titleRaw = stringValue(dictionary["title"]) ?? "Incoming Call"
    let title = sanitizeCallerName(titleRaw)
    if titleRaw.count > maxTitleLength {
      return .failure(.titleTooLong)
    }

    let body = stringValue(dictionary["body"])
    let timeoutMs = intValue(dictionary["timeout"]) ?? 0
    let isVideo = boolValue(dictionary["isVideo"]) ?? boolValue(dictionary["is_video"]) ?? false

    let payloadJson = buildPayloadJson(from: dictionary)
    if let payloadJson, payloadJson.utf8.count > maxPayloadJsonLength {
      return .failure(.payloadTooLarge)
    }

    return .success(
      ValidatedIncomingCall(
        uuid: uuid,
        title: title,
        body: body,
        timeoutMs: max(0, timeoutMs),
        isVideo: isVideo,
        payloadJson: payloadJson
      )
    )
  }

  static func validateJsShow(
    uuid: String,
    title: String,
    payloadJson: String?
  ) -> Result<(UUID, String, String?), ValidationError> {
    guard let parsed = parseUuid(uuid) else {
      return .failure(.invalidUuid)
    }
    let sanitized = sanitizeCallerName(title)
    if title.count > maxTitleLength {
      return .failure(.titleTooLong)
    }
    if let payloadJson, payloadJson.utf8.count > maxPayloadJsonLength {
      return .failure(.payloadTooLarge)
    }
    return .success((parsed, sanitized, payloadJson))
  }

  private static func stringValue(_ value: Any?) -> String? {
    if let s = value as? String { return s }
    if let n = value as? NSNumber { return n.stringValue }
    return nil
  }

  private static func intValue(_ value: Any?) -> Int? {
    if let n = value as? NSNumber { return n.intValue }
    if let s = value as? String { return Int(s) }
    return nil
  }

  private static func boolValue(_ value: Any?) -> Bool? {
    if let b = value as? Bool { return b }
    if let n = value as? NSNumber { return n.boolValue }
    if let s = value as? String {
      switch s.lowercased() {
      case "true", "1", "yes": return true
      case "false", "0", "no": return false
      default: return nil
      }
    }
    return nil
  }

  /// Reserved keys from the VoIP push schema; everything else becomes custom payload JSON.
  private static let reservedPushKeys: Set<String> = [
    "type", "uuid", "title", "body", "avatar", "timeout", "isVideo", "is_video",
  ]

  private static func buildPayloadJson(from dictionary: [AnyHashable: Any]) -> String? {
    var custom: [String: String] = [:]
    for (key, value) in dictionary {
      guard let keyString = key as? String, !reservedPushKeys.contains(keyString) else {
        continue
      }
      if let s = stringValue(value) {
        custom[keyString] = s
      }
    }
    guard !custom.isEmpty else { return nil }
    guard let data = try? JSONSerialization.data(withJSONObject: custom),
          let json = String(data: data, encoding: .utf8) else {
      return nil
    }
    return json
  }
}
