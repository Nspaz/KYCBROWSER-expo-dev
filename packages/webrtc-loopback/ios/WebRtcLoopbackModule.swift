import Foundation
import WebRTC
import React

@objc(WebRtcLoopback)
class WebRtcLoopback: RCTEventEmitter, RTCPeerConnectionDelegate {
  private static var sslInitialized = false
  private let peerFactory: RTCPeerConnectionFactory
  private var peerConnection: RTCPeerConnection?
  private var videoSource: RTCVideoSource?
  private var audioSource: RTCAudioSource?
  private var videoCapturer: AdvancedTestPatternCapturer?
  private var statsTimer: Timer?
  private var config: LoopbackConfig = LoopbackConfig()
  private var lastOfferId: String?

  override init() {
    if !WebRtcLoopback.sslInitialized {
      RTCInitializeSSL()
      WebRtcLoopback.sslInitialized = true
    }
    let encoderFactory = RTCDefaultVideoEncoderFactory()
    let decoderFactory = RTCDefaultVideoDecoderFactory()
    self.peerFactory = RTCPeerConnectionFactory(encoderFactory: encoderFactory, decoderFactory: decoderFactory)
    super.init()
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func supportedEvents() -> [String]! {
    return [
      "WebRtcLoopbackIceCandidate",
      "WebRtcLoopbackStats",
      "WebRtcLoopbackError",
      "WebRtcLoopbackState"
    ]
  }

  @objc(createAnswer:resolver:rejecter:)
  func createAnswer(_ payload: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let offerDict = payload["offer"] as? NSDictionary,
          let sdp = offerDict["sdp"] as? String,
          let type = offerDict["type"] as? String else {
      rejecter("invalid_offer", "Missing offer payload", nil)
      return
    }

    let configDict = payload["config"] as? NSDictionary
    config = LoopbackConfig(configDict: configDict)
    lastOfferId = (configDict?["offerId"] as? String) ?? nil

    let rtcConfig = RTCConfiguration()
    rtcConfig.sdpSemantics = .unifiedPlan
    rtcConfig.iceServers = config.iceServers
    rtcConfig.iceTransportPolicy = .all
    rtcConfig.bundlePolicy = .maxBundle
    rtcConfig.rtcpMuxPolicy = .require
    rtcConfig.continualGatheringPolicy = .gatherContinually

    let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: ["DtlsSrtpKeyAgreement": "true"])
    let pc = peerFactory.peerConnection(with: rtcConfig, constraints: constraints, delegate: self)
    peerConnection = pc

    setupLocalTracks()
    applySenderTuning()

    let offerDescription = RTCSessionDescription(type: type == "offer" ? .offer : .answer, sdp: sdp)
    pc.setRemoteDescription(offerDescription) { [weak self] error in
      if let error = error {
        self?.emitError("Failed to set remote description: \(error.localizedDescription)")
        rejecter("remote_description_failed", error.localizedDescription, error)
        return
      }

      let answerConstraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
      pc.answer(for: answerConstraints) { answer, err in
        if let err = err {
          self?.emitError("Failed to create answer: \(err.localizedDescription)")
          rejecter("answer_failed", err.localizedDescription, err)
          return
        }
        guard let answer = answer else {
          self?.emitError("Answer was nil")
          rejecter("answer_failed", "Answer was nil", nil)
          return
        }

        pc.setLocalDescription(answer) { setErr in
          if let setErr = setErr {
            self?.emitError("Failed to set local description: \(setErr.localizedDescription)")
            rejecter("local_description_failed", setErr.localizedDescription, setErr)
            return
          }

          self?.startStatsLoop()
          resolver(["sdp": answer.sdp, "type": "answer"])
        }
      }
    }
  }

  @objc(addIceCandidate:resolver:rejecter:)
  func addIceCandidate(_ payload: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let pc = peerConnection else {
      resolver(nil)
      return
    }
    guard let sdp = payload["candidate"] as? String,
          let sdpMid = payload["sdpMid"] as? String,
          let sdpMLineIndex = payload["sdpMLineIndex"] as? Int else {
      resolver(nil)
      return
    }
    let candidate = RTCIceCandidate(sdp: sdp, sdpMLineIndex: Int32(sdpMLineIndex), sdpMid: sdpMid)
    pc.add(candidate) { _ in
      resolver(nil)
    }
  }

  @objc(updateConfig:resolver:rejecter:)
  func updateConfig(_ payload: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    config = LoopbackConfig(configDict: payload)
    applySenderTuning()
    if let pc = peerConnection, config.enableIceRestart {
      pc.restartIce()
    }
    resolver(nil)
  }

  @objc(stop:rejecter:)
  func stop(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    teardown()
    resolver(nil)
  }

  @objc(getStats:rejecter:)
  func getStats(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let pc = peerConnection else {
      resolver([:])
      return
    }
    pc.statistics { report in
      resolver(self.extractStats(report))
    }
  }

  private func setupLocalTracks() {
    let videoSource = peerFactory.videoSource()
    let capturer = AdvancedTestPatternCapturer(delegate: videoSource)
    capturer.start(width: config.targetWidth, height: config.targetHeight, fps: config.targetFps)

    self.videoSource = videoSource
    self.videoCapturer = capturer

    let videoTrack = peerFactory.videoTrack(with: videoSource, trackId: "loopback_video")
    _ = peerConnection?.add(videoTrack, streamIds: ["loopback_stream"])

    let audioConstraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
    let audioSource = peerFactory.audioSource(with: audioConstraints)
    self.audioSource = audioSource
    let audioTrack = peerFactory.audioTrack(with: audioSource, trackId: "loopback_audio")
    _ = peerConnection?.add(audioTrack, streamIds: ["loopback_stream"])
  }

  private func applySenderTuning() {
    guard let pc = peerConnection else { return }
    for sender in pc.senders {
      guard sender.track?.kind == kRTCMediaStreamTrackKindVideo else { continue }
      var params = sender.parameters
      if config.enableSimulcast {
        let full = RTCRtpEncodingParameters()
        full.rid = "f"
        full.scaleResolutionDownBy = NSNumber(value: 1.0)
        let half = RTCRtpEncodingParameters()
        half.rid = "h"
        half.scaleResolutionDownBy = NSNumber(value: 2.0)
        let quarter = RTCRtpEncodingParameters()
        quarter.rid = "q"
        quarter.scaleResolutionDownBy = NSNumber(value: 4.0)
        params.encodings = [full, half, quarter]
      } else if params.encodings.isEmpty {
        params.encodings = [RTCRtpEncodingParameters()]
      }

      if config.maxBitrateKbps > 0 {
        params.encodings = params.encodings.map { encoding in
          let updated = encoding
          updated.maxBitrateBps = NSNumber(value: config.maxBitrateKbps * 1000)
          return updated
        }
      }
      sender.parameters = params
    }

    if let transceivers = pc.transceivers as? [RTCRtpTransceiver] {
      if let video = transceivers.first(where: { $0.mediaType == .video }) {
        applyCodecPreferences(transceiver: video)
      }
    }
  }

  private func applyCodecPreferences(transceiver: RTCRtpTransceiver) {
    let preferred = config.preferredCodec.lowercased()
    guard preferred != "auto",
          let caps = RTCRtpReceiver.getCapabilities(.video) else { return }
    let preferredCodecs = caps.codecs.filter { $0.mimeType.lowercased().contains(preferred) }
    if preferredCodecs.isEmpty { return }
    let otherCodecs = caps.codecs.filter { !preferredCodecs.contains($0) }
    transceiver.setCodecPreferences(preferredCodecs + otherCodecs)
  }

  private func startStatsLoop() {
    statsTimer?.invalidate()
    statsTimer = nil
    guard config.statsIntervalMs > 0 else { return }
    statsTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(config.statsIntervalMs) / 1000.0, repeats: true) { [weak self] _ in
      guard let self = self, let pc = self.peerConnection else { return }
      pc.statistics { report in
        self.sendEvent(withName: "WebRtcLoopbackStats", body: self.extractStats(report))
      }
    }
  }

  private func extractStats(_ report: RTCStatisticsReport) -> [String: Any] {
    var result: [String: Any] = [:]
    for stat in report.statistics.values {
      if stat.type == "inbound-rtp", let kind = stat.values["kind"] as? String, kind == "video" {
        result["fps"] = stat.values["framesPerSecond"]
        result["packetsLost"] = stat.values["packetsLost"]
        result["jitter"] = stat.values["jitter"]
        result["bytesReceived"] = stat.values["bytesReceived"]
        result["frameWidth"] = stat.values["frameWidth"]
        result["frameHeight"] = stat.values["frameHeight"]
      }
    }
    result["timestamp"] = Date().timeIntervalSince1970
    return result
  }

  private func emitError(_ message: String) {
    sendEvent(withName: "WebRtcLoopbackError", body: ["message": message])
  }

  private func teardown() {
    statsTimer?.invalidate()
    statsTimer = nil
    videoCapturer?.stop()
    videoCapturer = nil
    videoSource = nil
    audioSource = nil
    peerConnection?.close()
    peerConnection = nil
  }

  // MARK: - RTCPeerConnectionDelegate
  func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {
    sendEvent(withName: "WebRtcLoopbackState", body: ["signaling": "\(stateChanged.rawValue)"])
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
    sendEvent(withName: "WebRtcLoopbackState", body: ["iceConnection": "\(newState.rawValue)"])
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {
    sendEvent(withName: "WebRtcLoopbackState", body: ["iceGathering": "\(newState.rawValue)"])
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
    sendEvent(withName: "WebRtcLoopbackIceCandidate", body: [
      "candidate": [
        "candidate": candidate.sdp,
        "sdpMid": candidate.sdpMid ?? "",
        "sdpMLineIndex": Int(candidate.sdpMLineIndex)
      ],
      "offerId": lastOfferId ?? ""
    ])
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {}
  func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}
  func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {}
  func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {}
  func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {}
  func peerConnection(_ peerConnection: RTCPeerConnection, didStartReceivingOn transceiver: RTCRtpTransceiver) {}
}

private struct LoopbackConfig {
  var targetWidth: Int = 1080
  var targetHeight: Int = 1920
  var targetFps: Int = 30
  var preferredCodec: String = "auto"
  var maxBitrateKbps: Int = 0
  var enableSimulcast: Bool = false
  var enableIceRestart: Bool = true
  var statsIntervalMs: Int = 4000
  var iceServers: [RTCIceServer] = []

  init() {}

  init(configDict: NSDictionary?) {
    if let target = configDict?["target"] as? NSDictionary {
      targetWidth = target["width"] as? Int ?? targetWidth
      targetHeight = target["height"] as? Int ?? targetHeight
      targetFps = target["fps"] as? Int ?? targetFps
    }
    targetWidth = configDict?["targetWidth"] as? Int ?? targetWidth
    targetHeight = configDict?["targetHeight"] as? Int ?? targetHeight
    targetFps = configDict?["targetFPS"] as? Int ?? targetFps
    preferredCodec = configDict?["preferredCodec"] as? String ?? preferredCodec
    maxBitrateKbps = configDict?["maxBitrateKbps"] as? Int ?? maxBitrateKbps
    enableSimulcast = configDict?["enableSimulcast"] as? Bool ?? enableSimulcast
    enableIceRestart = configDict?["enableIceRestart"] as? Bool ?? enableIceRestart
    statsIntervalMs = configDict?["statsIntervalMs"] as? Int ?? statsIntervalMs

    if let ice = configDict?["iceServers"] as? [NSDictionary] {
      iceServers = ice.compactMap { server in
        guard let urls = server["urls"] else { return nil }
        let username = server["username"] as? String
        let credential = server["credential"] as? String
        if let urlString = urls as? String {
          return RTCIceServer(urlStrings: [urlString], username: username ?? "", credential: credential ?? "")
        } else if let urlArray = urls as? [String] {
          return RTCIceServer(urlStrings: urlArray, username: username ?? "", credential: credential ?? "")
        }
        return nil
      }
    }
  }
}
