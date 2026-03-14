/**
 * React hook for Web Bluetooth — connecting to real BLE hardware devices.
 *
 * ⚠️ Only for actual BLE hardware (sensors, beacons, radios).
 *    For browser-to-browser communication, use useWebRTCPeers instead.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  BLEDeviceManager,
  isWebBluetoothAvailable,
  type BLEDeviceInfo,
} from "@/lib/web-bluetooth";

interface UseBluetoothDeviceReturn {
  /** Whether Web Bluetooth is supported in this browser */
  isSupported: boolean;
  /** The currently selected device (null if none) */
  device: BLEDeviceInfo | null;
  /** Whether we're connected to the device */
  connected: boolean;
  /** Scanning / connecting in progress */
  loading: boolean;
  /** Last error message */
  error: string | null;
  /** Open the browser's BLE device picker */
  scan: (options?: {
    serviceUUIDs?: string[];
    namePrefix?: string;
    acceptAllDevices?: boolean;
  }) => Promise<void>;
  /** Connect to the selected device */
  connect: () => Promise<void>;
  /** Disconnect from the device */
  disconnect: () => void;
  /** Read a characteristic value (returns hex string) */
  readCharacteristic: (service: string, characteristic: string) => Promise<string>;
  /** Write a value to a characteristic */
  writeCharacteristic: (service: string, characteristic: string, value: Uint8Array) => Promise<void>;
}

export function useBluetoothDevice(): UseBluetoothDeviceReturn {
  const [device, setDevice] = useState<BLEDeviceInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<BLEDeviceManager | null>(null);

  const isSupported = isWebBluetoothAvailable();

  // Create manager on mount
  useEffect(() => {
    managerRef.current = new BLEDeviceManager({
      onConnect: (info) => {
        setDevice(info);
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
        setDevice((prev) => (prev ? { ...prev, connected: false } : null));
      },
      onError: (err) => setError(err.message),
    });

    return () => {
      managerRef.current?.disconnect();
    };
  }, []);

  const scan = useCallback(
    async (options?: {
      serviceUUIDs?: string[];
      namePrefix?: string;
      acceptAllDevices?: boolean;
    }) => {
      if (!managerRef.current) return;
      setLoading(true);
      setError(null);
      try {
        const info = await managerRef.current.requestDevice(options);
        setDevice(info);
      } catch (err) {
        if (err instanceof Error && err.message.includes("cancelled")) {
          // User cancelled the picker — not an error
        } else {
          setError(err instanceof Error ? err.message : "Scan failed");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const connect = useCallback(async () => {
    if (!managerRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const info = await managerRef.current.connect();
      setDevice(info);
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
    setConnected(false);
  }, []);

  const readCharacteristic = useCallback(
    async (service: string, characteristic: string): Promise<string> => {
      if (!managerRef.current) throw new Error("No BLE manager");
      const value = await managerRef.current.readCharacteristic(service, characteristic);
      // Convert DataView to hex string
      const bytes = new Uint8Array(value.buffer);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
    },
    []
  );

  const writeCharacteristic = useCallback(
    async (service: string, characteristic: string, value: Uint8Array) => {
      if (!managerRef.current) throw new Error("No BLE manager");
      await managerRef.current.writeCharacteristic(service, characteristic, value.buffer as ArrayBuffer);
    },
    []
  );

  return {
    isSupported,
    device,
    connected,
    loading,
    error,
    scan,
    connect,
    disconnect,
    readCharacteristic,
    writeCharacteristic,
  };
}
