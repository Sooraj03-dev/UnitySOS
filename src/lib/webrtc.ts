/**
 * WebRTC Peer Connection wrapper for browser-to-browser P2P communication.
 *
 * Each PeerConnection manages one RTCPeerConnection with a data channel
 * for text messages, JSON payloads, and binary file transfer.
 */

// ── Types ────────────────────────────────────────────────────────────

export type ConnectionState = "new" | "connecting" | "connected" | "disconnected" | "failed" | "closed";

export interface PeerMessage {
  type: "text" | "sos" | "file-meta" | "file-chunk" | "location" | "ping";
  payload: string;
  from: string;
  timestamp: number;
}

export interface PeerEvents {
  onMessage?: (msg: PeerMessage) => void;
  onStateChange?: (state: ConnectionState) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

// ── STUN / TURN config ───────────────────────────────────────────────

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

// ── Peer Connection class ────────────────────────────────────────────

export class PeerConnection {
  readonly peerId: string;
  private pc: RTCPeerConnection;
  private dc: RTCDataChannel | null = null;
  private events: PeerEvents;
  private _state: ConnectionState = "new";

  constructor(peerId: string, events: PeerEvents = {}) {
    this.peerId = peerId;
    this.events = events;

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // ICE candidates
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.events.onIceCandidate?.(e.candidate);
      }
    };

    // Connection state
    this.pc.onconnectionstatechange = () => {
      const map: Record<string, ConnectionState> = {
        new: "new",
        connecting: "connecting",
        connected: "connected",
        disconnected: "disconnected",
        failed: "failed",
        closed: "closed",
      };
      this._state = map[this.pc.connectionState] ?? "new";
      this.events.onStateChange?.(this._state);
    };

    // Incoming data channel from remote peer
    this.pc.ondatachannel = (e) => {
      this.setupDataChannel(e.channel);
    };
  }

  get state(): ConnectionState {
    return this._state;
  }

  // ── Offer / Answer ───────────────────────────────────────────────

  /** Create an SDP offer (caller side) */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    // Create data channel before creating the offer
    const dc = this.pc.createDataChannel("sos-mesh", { ordered: true });
    this.setupDataChannel(dc);

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  /** Handle an incoming SDP offer and return an answer (callee side) */
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  /** Apply the remote SDP answer (caller side) */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /** Add a remote ICE candidate */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // ── Data channel ─────────────────────────────────────────────────

  private setupDataChannel(dc: RTCDataChannel) {
    this.dc = dc;
    dc.binaryType = "arraybuffer";

    dc.onopen = () => {
      this._state = "connected";
      this.events.onStateChange?.("connected");
    };

    dc.onclose = () => {
      this._state = "disconnected";
      this.events.onStateChange?.("disconnected");
    };

    dc.onmessage = (e) => {
      try {
        const msg: PeerMessage = JSON.parse(e.data);
        this.events.onMessage?.(msg);
      } catch {
        // Non-JSON message — wrap it
        this.events.onMessage?.({
          type: "text",
          payload: String(e.data),
          from: this.peerId,
          timestamp: Date.now(),
        });
      }
    };
  }

  /** Send a structured message over the data channel */
  send(msg: PeerMessage): boolean {
    if (!this.dc || this.dc.readyState !== "open") return false;
    this.dc.send(JSON.stringify(msg));
    return true;
  }

  /** Send raw text */
  sendText(text: string, fromId: string): boolean {
    return this.send({
      type: "text",
      payload: text,
      from: fromId,
      timestamp: Date.now(),
    });
  }

  /** Send SOS alert */
  sendSOS(payload: string, fromId: string): boolean {
    return this.send({
      type: "sos",
      payload,
      from: fromId,
      timestamp: Date.now(),
    });
  }

  /** Send location */
  sendLocation(coords: { lat: number; lng: number }, fromId: string): boolean {
    return this.send({
      type: "location",
      payload: JSON.stringify(coords),
      from: fromId,
      timestamp: Date.now(),
    });
  }

  // ── Cleanup ──────────────────────────────────────────────────────

  close() {
    this.dc?.close();
    this.pc.close();
    this._state = "closed";
    this.events.onStateChange?.("closed");
  }
}
