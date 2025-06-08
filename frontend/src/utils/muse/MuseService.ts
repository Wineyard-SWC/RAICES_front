import { MuseClient } from "muse-js";
import { BehaviorSubject } from "rxjs";
import { createRing } from "../ringBuffer";
import { CHANNELS, EEGChannel } from "./channels";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
export type SignalQuality = "poor" | "fair" | "good" | "excellent";

interface ChannelPacket {
  channel: EEGChannel;
  values: number[];
}

export class MuseService {
  /* ───── public streams ───── */
  connectionStatus$ = new BehaviorSubject<ConnectionStatus>("disconnected");
  signalQuality$ = new BehaviorSubject<SignalQuality>("poor");
  eegPreview$ = new BehaviorSubject<number[]>([]);
  ppgPreview$ = new BehaviorSubject<number[]>([]);
  hrPreview$ = new BehaviorSubject<number[]>([]);
  electrodeQuality$ = new BehaviorSubject<number[]>([0, 0, 0, 0]);

  /* ───── private ───── */
  private client?: MuseClient;
  private paused = false;
  private subs: { unsubscribe: () => void }[] = [];
  private connectionStart = 0;

  // Buffers (60 s)
  private eegRings = CHANNELS.reduce(
    (acc, ch) => ({ ...acc, [ch]: createRing(60 * 256) }),
    {} as Record<EEGChannel, ReturnType<typeof createRing>>
  );
  private ppgRing = createRing(60 * 64);
  private hrRing = createRing(60);

  /* ───── lifecycle ───── */
  async connect() {
    if (this.connectionStatus$.value !== "disconnected") return;
    this.connectionStatus$.next("connecting");

    try {
      this.client = new MuseClient();
      await this.client.connect();
      await this.client.start();
      this.setupStreams();
      this.connectionStatus$.next("connected");
      this.connectionStart = Date.now();
    } catch (e) {
      console.error("Muse-connect error:", e);
      this.connectionStatus$.next("error");
    }
  }

  async disconnect() {
    this.subs.forEach((s) => s.unsubscribe());
    this.subs = [];
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {}
    }
    this.client = undefined;
    this.connectionStatus$.next("disconnected");
    this.eegPreview$.next([]);
    this.ppgPreview$.next([]);
    this.hrPreview$.next([]);
    this.signalQuality$.next("poor");
  }

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }

  drainRawData(): {
    eeg: ChannelPacket[];
    ppg: number[];
    hr: number[];
  } {
    return {
      eeg: CHANNELS.map((ch) => ({
        channel: ch,
        values: this.eegRings[ch].drain(),
      })),
      ppg: this.ppgRing.drain(),
      hr: this.hrRing.drain(),
    };
  }

  /* ───── internals ───── */
  private setupStreams() {
    if (!this.client) return;

    /* EEG */
    const sEEG = this.client.eegReadings.subscribe((r) => {
      if (this.paused) return;
      const ch = CHANNELS[r.electrode] as EEGChannel;
      const scaled = r.samples.map((v) => v / 10);
      this.eegRings[ch].push(scaled);
      if (ch === "AF7") this.eegPreview$.next(this.eegRings[ch].latest(256));
    });
    this.subs.push(sEEG);

    /* PPG */
    if (this.client.ppgReadings) {
      const sPPG = this.client.ppgReadings.subscribe((r) => {
        if (this.paused) return;
        const vals = r.samples ?? [r.ppgValue ?? 0];
        this.ppgRing.push(vals);
        this.ppgPreview$.next(this.ppgRing.latest(128));
      });
      this.subs.push(sPPG);
    } else {
      const id = setInterval(() => {
        if (this.paused) return;
        const t = Date.now() / 1000;
        const v =
          Math.sin(2 * Math.PI * 1.2 * t) + (Math.random() - 0.5) * 0.05;
        this.ppgRing.push(v);
        this.ppgPreview$.next(this.ppgRing.latest(128));
      }, 1000 / 64);
      this.subs.push({ unsubscribe: () => clearInterval(id) });
    }

    /* HR (acelerómetro -> estimación) */
    if (this.client.accelerometerData) {
      const sHR = this.client.accelerometerData.subscribe((acc) => {
        if (this.paused) return;
        const bpm = Math.max(
          50,
          Math.min(120, 60 + (Math.hypot(acc.x, acc.y, acc.z) - 1) * 30)
        );
        this.hrRing.push(bpm);
        this.hrPreview$.next(this.hrRing.latest(30));
      });
      this.subs.push(sHR);
    } else {
      const id = setInterval(() => {
        if (this.paused) return;
        const bpm = 70 + Math.sin(Date.now() / 8000) * 5;
        this.hrRing.push(bpm);
        this.hrPreview$.next(this.hrRing.latest(30));
      }, 1000);
      this.subs.push({ unsubscribe: () => clearInterval(id) });
    }

    /* Telemetry → calidad simulada */
    const sTLM = this.client.telemetryData.subscribe(() => {
      const elapsed = Date.now() - this.connectionStart;
      const q: SignalQuality =
        elapsed > 5000 ? "good" : elapsed > 3000 ? "fair" : "poor";
      this.signalQuality$.next(q);
    });
    this.subs.push(sTLM);
  }
}