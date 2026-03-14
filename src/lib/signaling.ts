/**
 * Supabase Realtime-based signaling for WebRTC peer discovery and SDP/ICE exchange.
 *
 * Uses Broadcast (ephemeral) channels — no database table required.
 * Uses Presence for tracking who is online in a room.
 */

import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────

export type SignalType = "offer" | "answer" | "ice-candidate" | "peer-joined" | "peer-left";

export interface SignalMessage {
  type: SignalType;
  from: string;
  to: string; // target peer ID, or "*" for broadcast
  payload: unknown;
  timestamp: number;
}

export interface PresencePeer {
  peerId: string;
  joinedAt: number;
  metadata?: Record<string, unknown>;
}

export interface SignalingEvents {
  onSignal?: (msg: SignalMessage) => void;
  onPresenceSync?: (peers: PresencePeer[]) => void;
  onError?: (error: Error) => void;
}

// ── Signaling Channel ────────────────────────────────────────────────

export class SignalingChannel {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private localPeerId: string;
  private events: SignalingEvents;
  private _joined = false;

  constructor(roomId: string, localPeerId: string, events: SignalingEvents = {}) {
    this.roomId = roomId;
    this.localPeerId = localPeerId;
    this.events = events;
  }

  get joined(): boolean {
    return this._joined;
  }

  /** Join the signaling room */
  async join(metadata?: Record<string, unknown>): Promise<void> {
    if (this._joined) return;

    const channelName = `sos-mesh:${this.roomId}`;

    this.channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    // ── Listen for broadcast signals ──────────────────────────────
    this.channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      const msg = payload as SignalMessage;
      // Only process messages targeted at us or broadcast
      if (msg.to === this.localPeerId || msg.to === "*") {
        this.events.onSignal?.(msg);
      }
    });

    // ── Presence tracking ─────────────────────────────────────────
    this.channel.on("presence", { event: "sync" }, () => {
      const state = this.channel!.presenceState<{
        peerId: string;
        joinedAt: number;
        metadata?: Record<string, unknown>;
      }>();
      const peers: PresencePeer[] = [];
      for (const key of Object.keys(state)) {
        for (const p of state[key]) {
          if (p.peerId !== this.localPeerId) {
            peers.push({
              peerId: p.peerId,
              joinedAt: p.joinedAt,
              metadata: p.metadata,
            });
          }
        }
      }
      this.events.onPresenceSync?.(peers);
    });

    // ── Subscribe ─────────────────────────────────────────────────
    await new Promise<void>((resolve, reject) => {
      this.channel!.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track our presence
          await this.channel!.track({
            peerId: this.localPeerId,
            joinedAt: Date.now(),
            metadata: metadata ?? {},
          });
          this._joined = true;
          resolve();
        } else if (status === "CHANNEL_ERROR") {
          reject(new Error("Failed to join signaling channel"));
        }
      });
    });
  }

  /** Send a signal message to a specific peer or broadcast */
  async sendSignal(type: SignalType, to: string, payload: unknown): Promise<void> {
    if (!this.channel || !this._joined) {
      throw new Error("Not connected to signaling channel");
    }

    const msg: SignalMessage = {
      type,
      from: this.localPeerId,
      to,
      payload,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: "broadcast",
      event: "signal",
      payload: msg,
    });
  }

  /** Send an SDP offer to a specific peer */
  async sendOffer(to: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    await this.sendSignal("offer", to, sdp);
  }

  /** Send an SDP answer to a specific peer */
  async sendAnswer(to: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    await this.sendSignal("answer", to, sdp);
  }

  /** Send an ICE candidate to a specific peer */
  async sendIceCandidate(to: string, candidate: RTCIceCandidateInit): Promise<void> {
    await this.sendSignal("ice-candidate", to, candidate);
  }

  /** Leave the signaling room */
  async leave(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await supabase.removeChannel(this.channel);
      this.channel = null;
      this._joined = false;
    }
  }
}

/**
 * Generate a short random peer ID.
 * In production you'd use the Supabase auth user ID instead.
 */
export function generatePeerId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
