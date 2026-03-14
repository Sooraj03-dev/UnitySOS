/**
 * Web Bluetooth API wrapper for communicating with real BLE hardware devices.
 *
 * ONLY use this for actual Bluetooth Low Energy hardware (sensors, beacons, radios).
 * For browser-to-browser P2P, use WebRTC instead (see webrtc.ts / signaling.ts).
 *
 * ⚠️  Web Bluetooth only works in Chromium browsers (Chrome, Edge, Opera) over HTTPS.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface BLEDeviceInfo {
  id: string;
  name: string | undefined;
  connected: boolean;
  services: string[];
}

export interface BLECharacteristicInfo {
  uuid: string;
  service: string;
  properties: {
    read: boolean;
    write: boolean;
    notify: boolean;
  };
}

export interface BLEEvents {
  onConnect?: (device: BLEDeviceInfo) => void;
  onDisconnect?: (deviceId: string) => void;
  onNotification?: (characteristicUuid: string, value: DataView) => void;
  onError?: (error: Error) => void;
}

// ── Availability check ───────────────────────────────────────────────

/** Returns true if the Web Bluetooth API is available in this browser */
export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

// ── BLE Device Manager ───────────────────────────────────────────────

export class BLEDeviceManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private events: BLEEvents;
  private notifySubscriptions: Map<string, BluetoothRemoteGATTCharacteristic> = new Map();

  constructor(events: BLEEvents = {}) {
    this.events = events;
  }

  get isConnected(): boolean {
    return this.server?.connected ?? false;
  }

  get deviceInfo(): BLEDeviceInfo | null {
    if (!this.device) return null;
    return {
      id: this.device.id,
      name: this.device.name,
      connected: this.isConnected,
      services: [],
    };
  }

  // ── Scan & Connect ─────────────────────────────────────────────

  /**
   * Request a BLE device from the user via the browser's device picker.
   * @param options - optional filters (service UUIDs, name prefixes)
   */
  async requestDevice(options?: {
    serviceUUIDs?: string[];
    namePrefix?: string;
    acceptAllDevices?: boolean;
  }): Promise<BLEDeviceInfo> {
    if (!isWebBluetoothAvailable()) {
      throw new Error("Web Bluetooth is not available in this browser");
    }

    const requestOptions: RequestDeviceOptions = options?.acceptAllDevices
      ? { acceptAllDevices: true, optionalServices: options?.serviceUUIDs ?? [] }
      : {
          filters: [
            ...(options?.serviceUUIDs?.map((s) => ({ services: [s] })) ?? []),
            ...(options?.namePrefix ? [{ namePrefix: options.namePrefix }] : []),
            // Fallback: if no filters provided, accept all
            ...(!options?.serviceUUIDs?.length && !options?.namePrefix
              ? []
              : []),
          ],
          optionalServices: options?.serviceUUIDs ?? [],
        };

    // If no filters at all, use acceptAllDevices
    const hasFilters =
      (options?.serviceUUIDs?.length ?? 0) > 0 || !!options?.namePrefix;
    const finalOptions = hasFilters
      ? requestOptions
      : { acceptAllDevices: true, optionalServices: options?.serviceUUIDs ?? [] };

    this.device = await navigator.bluetooth.requestDevice(finalOptions);

    // Listen for disconnect
    this.device.addEventListener("gattserverdisconnected", () => {
      this.events.onDisconnect?.(this.device?.id ?? "unknown");
      this.server = null;
    });

    return this.getDeviceInfo();
  }

  /** Connect to the selected device's GATT server */
  async connect(): Promise<BLEDeviceInfo> {
    if (!this.device) throw new Error("No device selected — call requestDevice() first");
    if (!this.device.gatt) throw new Error("GATT server not available on this device");

    this.server = await this.device.gatt.connect();

    const info = this.getDeviceInfo();
    this.events.onConnect?.(info);
    return info;
  }

  // ── Services & Characteristics ─────────────────────────────────

  /** List primary services on the connected device */
  async getServices(): Promise<BluetoothRemoteGATTService[]> {
    if (!this.server?.connected) throw new Error("Not connected");
    return await this.server.getPrimaryServices();
  }

  /** Get a specific characteristic */
  async getCharacteristic(
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<BluetoothRemoteGATTCharacteristic> {
    if (!this.server?.connected) throw new Error("Not connected");
    const service = await this.server.getPrimaryService(serviceUuid);
    return await service.getCharacteristic(characteristicUuid);
  }

  /** Read a characteristic value */
  async readCharacteristic(serviceUuid: string, characteristicUuid: string): Promise<DataView> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    return await char.readValue();
  }

  /** Write a value to a characteristic */
  async writeCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
    value: BufferSource
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    await char.writeValue(value);
  }

  /** Subscribe to characteristic notifications */
  async subscribeToNotifications(
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    await char.startNotifications();

    const handler = (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      if (target.value) {
        this.events.onNotification?.(characteristicUuid, target.value);
      }
    };

    char.addEventListener("characteristicvaluechanged", handler);
    this.notifySubscriptions.set(characteristicUuid, char);
  }

  // ── Disconnect ─────────────────────────────────────────────────

  disconnect(): void {
    // Unsubscribe all notifications
    Array.from(this.notifySubscriptions.values()).forEach((char) => {
      try {
        char.stopNotifications();
      } catch {
        // Already disconnected
      }
    });
    this.notifySubscriptions.clear();

    if (this.server?.connected) {
      this.device?.gatt?.disconnect();
    }
    this.server = null;
  }

  // ── Helpers ────────────────────────────────────────────────────

  private getDeviceInfo(): BLEDeviceInfo {
    return {
      id: this.device?.id ?? "",
      name: this.device?.name,
      connected: this.isConnected,
      services: [],
    };
  }
}
