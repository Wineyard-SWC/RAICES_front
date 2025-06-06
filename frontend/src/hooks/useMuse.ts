"use client";

import { useSyncExternalStore, useCallback } from "react";
import { getMuseService } from "@/utils/muse/museSingleton";
import { BehaviorSubject } from "rxjs";

function fromSubject<T>(subject: BehaviorSubject<T>) {
  return {
    get: () => subject.value,
    sub: (callback: () => void) => {
      const sub = subject.subscribe(() => callback());
      return () => sub.unsubscribe();          // ← cleanup
    },
  };
}


const useStore = <T,>(subject: BehaviorSubject<T>) =>
  useSyncExternalStore(fromSubject(subject).sub, () => subject.value);

export function useMuse() {
  const svc = getMuseService();

  const connectionStatus = useStore(svc.connectionStatus$);
  const signalQuality    = useStore(svc.signalQuality$);
  const eegData          = useStore(svc.eegPreview$);
  const ppgData          = useStore(svc.ppgPreview$);
  const hrData           = useStore(svc.hrPreview$);
  const electrodeQuality = useStore(svc.electrodeQuality$);

  /* métodos idénticos */
  const connect      = useCallback(() => svc.connect(),      [svc]);
  const disconnect   = useCallback(() => svc.disconnect(),   [svc]);
  const pause        = useCallback(() => svc.pause(),        [svc]);
  const resume       = useCallback(() => svc.resume(),       [svc]);
  const drainRawData = useCallback(() => svc.drainRawData(), [svc]);

  return {
    connectionStatus,
    signalQuality,
    eegData,
    ppgData,
    hrData,
    electrodeQuality,
    connect,
    disconnect,
    pause,
    resume,
    drainRawData,
  };
}