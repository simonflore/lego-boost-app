import ExpoModulesCore
import GameController

/// Exposes the first connected extended gamepad (MFi, DualShock, DualSense, Xbox...)
/// to JS.
///
/// GameController is driven from the main thread: all framework access happens
/// there, from app start, and a 60 Hz main-thread timer caches a snapshot that
/// JS reads synchronously via `getState()` / `listControllers()`.
public class BoostGamepadModule: Module {
  private let lock = NSLock()
  private var cachedState: [String: Any]?
  private var cachedName: String?
  private var cachedList: [[String: Any]] = []
  private var observers: [NSObjectProtocol] = []
  private var timer: Timer?
  private var lastLoggedCount = -1
  private var loggedJsCall = false

  public func definition() -> ModuleDefinition {
    Name("BoostGamepad")

    Events("onConnect", "onDisconnect")

    OnCreate {
      Self.log("OnCreate")
      DispatchQueue.main.async { [weak self] in self?.startOnMain() }
    }

    OnDestroy {
      DispatchQueue.main.async { [weak self] in self?.stopOnMain() }
    }

    Function("getControllerName") { () -> String? in
      self.lock.lock(); defer { self.lock.unlock() }
      return self.cachedName
    }

    Function("listControllers") { () -> [[String: Any]] in
      if !self.loggedJsCall { self.loggedJsCall = true; Self.log("JS called listControllers") }
      self.lock.lock(); defer { self.lock.unlock() }
      return self.cachedList
    }

    // Snapshot of the current pad, or nil when nothing is connected.
    Function("getState") { () -> [String: Any]? in
      self.lock.lock(); defer { self.lock.unlock() }
      return self.cachedState
    }
  }

  // MARK: - Main thread

  private func startOnMain() {
    Self.log("startOnMain: controllers=\(GCController.controllers().count)")
    let center = NotificationCenter.default
    observers.append(center.addObserver(
      forName: .GCControllerDidConnect, object: nil, queue: .main
    ) { [weak self] note in
      guard let self else { return }
      Self.log("didConnect: \(String(describing: note.object))")
      self.refreshOnMain()
      let name = (note.object as? GCController).map(Self.displayName) ?? "Controller"
      self.sendEvent("onConnect", ["name": name])
    })
    observers.append(center.addObserver(
      forName: .GCControllerDidDisconnect, object: nil, queue: .main
    ) { [weak self] _ in
      guard let self else { return }
      Self.log("didDisconnect")
      self.refreshOnMain()
      self.sendEvent("onDisconnect", ["stillConnected": self.cachedStateIsSet()])
    })
    // Picks up controllers that pair while the app is open.
    GCController.startWirelessControllerDiscovery(completionHandler: nil)

    let t = Timer(timeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
      self?.refreshOnMain()
    }
    RunLoop.main.add(t, forMode: .common)
    timer = t
    refreshOnMain()
  }

  private func stopOnMain() {
    timer?.invalidate()
    timer = nil
    observers.forEach { NotificationCenter.default.removeObserver($0) }
    observers.removeAll()
    GCController.stopWirelessControllerDiscovery()
  }

  private func refreshOnMain() {
    let controllers = GCController.controllers()
    let active = GCController.current?.extendedGamepad != nil
      ? GCController.current
      : controllers.first { $0.extendedGamepad != nil }

    let list: [[String: Any]] = controllers.map { c in
      [
        "name": Self.displayName(c),
        "category": c.productCategory,
        "extended": c.extendedGamepad != nil,
        "micro": c.microGamepad != nil,
      ]
    }
    let state = active?.extendedGamepad.map(Self.snapshot)
    let name = active.map(Self.displayName)

    if controllers.count != lastLoggedCount {
      lastLoggedCount = controllers.count
      Self.log("controllers=\(controllers.count) current=\(String(describing: GCController.current?.vendorName)) list=\(list)")
    }

    lock.lock()
    cachedList = list
    cachedState = state
    cachedName = name
    lock.unlock()
  }

  private func cachedStateIsSet() -> Bool {
    lock.lock(); defer { lock.unlock() }
    return cachedState != nil
  }

  // MARK: - Helpers

  static func log(_ message: String) {
    print("[BoostGamepad] \(message)")
    NSLog("[BoostGamepad] %@", message)
  }

  private static func snapshot(_ pad: GCExtendedGamepad) -> [String: Any] {
    [
      "leftX": pad.leftThumbstick.xAxis.value,
      "leftY": pad.leftThumbstick.yAxis.value,
      "rightX": pad.rightThumbstick.xAxis.value,
      "rightY": pad.rightThumbstick.yAxis.value,
      "leftTrigger": pad.leftTrigger.value,
      "rightTrigger": pad.rightTrigger.value,
      "a": pad.buttonA.isPressed,
      "b": pad.buttonB.isPressed,
      "x": pad.buttonX.isPressed,
      "y": pad.buttonY.isPressed,
      "leftShoulder": pad.leftShoulder.isPressed,
      "rightShoulder": pad.rightShoulder.isPressed,
      "dpadUp": pad.dpad.up.isPressed,
      "dpadDown": pad.dpad.down.isPressed,
      "dpadLeft": pad.dpad.left.isPressed,
      "dpadRight": pad.dpad.right.isPressed,
      "menu": pad.buttonMenu.isPressed,
      "options": pad.buttonOptions?.isPressed ?? false,
    ]
  }

  private static func displayName(_ c: GCController) -> String {
    if let name = c.vendorName, !name.isEmpty { return name }
    return c.productCategory.isEmpty ? "Controller" : c.productCategory
  }
}
