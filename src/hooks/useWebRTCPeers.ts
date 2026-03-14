/**
 * React hook for managing WebRTC peer connections with Supabase signaling.
 *
 * Provides: joinRoom / leaveRoom, live peer list, send / broadcast messages,
 * and incoming message callbacks.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PeerConnection, type PeerMessage, type ConnectionState } from "@/lib/webrtc";
import { SignalingChannel, generatePeerId, type PresencePeer, type SignalMessage } from "@/lib/signaling";

// ── Types ────────────────────────────────────────────────────────────

export interface PeerInfo {
  peerId: string;
  state: ConnectionState;
  joinedAt: number;
}

interface UseWebRTCPeersReturn {
  /** Our local peer ID */
  localPeerId: string;
  /** Currently visible peers (from Presence) */
  peers: PeerInfo[];
  /** Received messages */
  messages: PeerMessage[];
  /** Whether we're in a room */
  inRoom: boolean;
  /** Join a room by ID */
  joinRoom: (roomId: string) => Promise<void>;
  /** Leave the current room */
  leaveRoom: () => Promise<void>;
  /** Send a message to a specific peer */
  sendMessage: (peerId: string, text: string) => void;
  /** Broadcast a message to all connected peers */
  broadcastMessage: (text: string) => void;
  /** Send an SOS alert to all peers */
  broadcastSOS: (payload: string) => void;
  /** Send location to all peers */
  broadcastLocation: (lat: number, lng: number) => void;
  /** Connection error (if any) */
  error: string | null;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useWebRTCPeers(): UseWebRTCPeersReturn {
  const localPeerIdRef = useRef<string>(generatePeerId());
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signalingRef = useRef<SignalingChannel | null>(null);
  const connectionsRef = useRef<Map<string, PeerConnection>>(new Map());

  // ── Helpers ──────────────────────────────────────────────────────

  const addMessage = useCallback((msg: PeerMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updatePeerState = useCallback((peerId: string, state: ConnectionState) => {
    setPeers((prev) =>
      prev.map((p) => (p.peerId === peerId ? { ...p, state } : p))
    );
  }, []);

  /** Create a PeerConnection for a given remote peer */
  const createPeerConnection = useCallback(
    (remotePeerId: string): PeerConnection => {
      const pc = new PeerConnection(remotePeerId, {
        onMessage: addMessage,
        onStateChange: (state) => updatePeerState(remotePeerId, state),
        onIceCandidate: (candidate) => {
          signalingRef.current?.sendIceCandidate(remotePeerId, candidate.toJSON());
        },
      });
      connectionsRef.current.set(remotePeerId, pc);
      return pc;
    },
    [addMessage, updatePeerState]
  );

  // ── Signal handler ───────────────────────────────────────────────

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      try {
        if (msg.type === "offer") {
          // Someone sent us an offer — create a connection and answer
          let pc = connectionsRef.current.get(msg.from);
          if (!pc) {
            pc = createPeerConnection(msg.from);
          }
          const answer = await pc.handleOffer(msg.payload as RTCSessionDescriptionInit);
          await signalingRef.current?.sendAnswer(msg.from, answer);
        } else if (msg.type === "answer") {
          const pc = connectionsRef.current.get(msg.from);
          if (pc) {
            await pc.handleAnswer(msg.payload as RTCSessionDescriptionInit);
          }
        } else if (msg.type === "ice-candidate") {
          const pc = connectionsRef.current.get(msg.from);
          if (pc) {
            await pc.addIceCandidate(msg.payload as RTCIceCandidateInit);
          }
        }
      } catch (err) {
        console.error("[WebRTC] Signal handling error:", err);
      }
    },
    [createPeerConnection]
  );

  // ── Presence sync ────────────────────────────────────────────────

  const handlePresenceSync = useCallback(
    async (presencePeers: PresencePeer[]) => {
      // Update peer list
      setPeers(
        presencePeers.map((p) => ({
          peerId: p.peerId,
          state: connectionsRef.current.get(p.peerId)?.state ?? "new",
          joinedAt: p.joinedAt,
        }))
      );

      // Initiate connections to new peers (we call if our ID is lexicographically smaller)
      for (const p of presencePeers) {
        if (
          !connectionsRef.current.has(p.peerId) &&
          localPeerIdRef.current < p.peerId // deterministic: lower ID initiates
        ) {
          try {
            const pc = createPeerConnection(p.peerId);
            const offer = await pc.createOffer();
            await signalingRef.current?.sendOffer(p.peerId, offer);
          } catch (err) {
            console.error("[WebRTC] Failed to create offer for", p.peerId, err);
          }
        }
      }

      // Clean up connections to peers that left
      const activePeerIds = new Set(presencePeers.map((p) => p.peerId));
      Array.from(connectionsRef.current.entries()).forEach(([id, pc]) => {
        if (!activePeerIds.has(id)) {
          pc.close();
          connectionsRef.current.delete(id);
        }
      });
    },
    [createPeerConnection]
  );

  // ── Join / Leave ─────────────────────────────────────────────────

  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        setError(null);
        const signaling = new SignalingChannel(roomId, localPeerIdRef.current, {
          onSignal: handleSignal,
          onPresenceSync: handlePresenceSync,
          onError: (err) => setError(err.message),
        });
        signalingRef.current = signaling;
        await signaling.join();
        setInRoom(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
      }
    },
    [handleSignal, handlePresenceSync]
  );

  const leaveRoom = useCallback(async () => {
    // Close all peer connections
    Array.from(connectionsRef.current.values()).forEach((pc) => pc.close());
    connectionsRef.current.clear();

    // Leave signaling
    await signalingRef.current?.leave();
    signalingRef.current = null;

    setPeers([]);
    setInRoom(false);
  }, []);

  // ── Messaging ────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (peerId: string, text: string) => {
      const pc = connectionsRef.current.get(peerId);
      if (pc) {
        const sent = pc.sendText(text, localPeerIdRef.current);
        if (sent) {
          addMessage({
            type: "text",
            payload: text,
            from: localPeerIdRef.current,
            timestamp: Date.now(),
          });
        }
      }
    },
    [addMessage]
  );

  const broadcastMessage = useCallback(
    (text: string) => {
      let anySent = false;
      Array.from(connectionsRef.current.values()).forEach((pc) => {
        if (pc.sendText(text, localPeerIdRef.current)) anySent = true;
      });
      if (anySent) {
        addMessage({
          type: "text",
          payload: text,
          from: localPeerIdRef.current,
          timestamp: Date.now(),
        });
      }
    },
    [addMessage]
  );

  const broadcastSOS = useCallback(
    (payload: string) => {
      Array.from(connectionsRef.current.values()).forEach((pc) => {
        pc.sendSOS(payload, localPeerIdRef.current);
      });
      addMessage({
        type: "sos",
        payload,
        from: localPeerIdRef.current,
        timestamp: Date.now(),
      });
    },
    [addMessage]
  );

  const broadcastLocation = useCallback(
    (lat: number, lng: number) => {
      Array.from(connectionsRef.current.values()).forEach((pc) => {
        pc.sendLocation({ lat, lng }, localPeerIdRef.current);
      });
      addMessage({
        type: "location",
        payload: JSON.stringify({ lat, lng }),
        from: localPeerIdRef.current,
        timestamp: Date.now(),
      });
    },
    [addMessage]
  );

  // ── Cleanup on unmount ───────────────────────────────────────────

  useEffect(() => {
    const connections = connectionsRef.current;
    const signaling = signalingRef.current;
    return () => {
      Array.from(connections.values()).forEach((pc) => pc.close());
      connections.clear();
      signaling?.leave();
    };
  }, []);

  return {
    localPeerId: localPeerIdRef.current,
    peers,
    messages,
    inRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    broadcastMessage,
    broadcastSOS,
    broadcastLocation,
    error,
  };
}
