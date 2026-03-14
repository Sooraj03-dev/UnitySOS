/**
 * App-wide WebRTC context provider.
 *
 * Wrap your layout with <WebRTCProvider> so any page can access
 * the P2P mesh (peer list, messaging, SOS broadcast, etc.).
 */

"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWebRTCPeers } from "@/hooks/useWebRTCPeers";
import type { PeerInfo } from "@/hooks/useWebRTCPeers";
import type { PeerMessage } from "@/lib/webrtc";

interface WebRTCContextType {
  localPeerId: string;
  peers: PeerInfo[];
  messages: PeerMessage[];
  inRoom: boolean;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  sendMessage: (peerId: string, text: string) => void;
  broadcastMessage: (text: string) => void;
  broadcastSOS: (payload: string) => void;
  broadcastLocation: (lat: number, lng: number) => void;
  error: string | null;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const webrtc = useWebRTCPeers();

  return (
    <WebRTCContext.Provider value={webrtc}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
}
