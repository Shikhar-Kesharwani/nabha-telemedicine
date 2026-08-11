/**
 * Realtime WebRTC Call Signaling Service for Patient-to-Doctor Live Calls
 * Uses BroadcastChannel & LocalStorage Event Listeners for 100% free cross-tab signaling.
 */

export interface CallSignalPayload {
  type: 'CALL_INITIATED' | 'CALL_ACCEPTED' | 'CALL_DECLINED' | 'CALL_ENDED';
  doctorId: string;
  doctorName: string;
  patientName: string;
  timestamp: number;
}

const CHANNEL_NAME = 'sehat-telemedicine-call-signaling';
const STORAGE_KEY = 'sehat-call-signal';

export function initiateCallSignal(doctorId: string, doctorName: string, patientName: string) {
  const payload: CallSignalPayload = {
    type: 'CALL_INITIATED',
    doctorId,
    doctorName,
    patientName,
    timestamp: Date.now(),
  };

  // Broadcast to other tabs
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch (err) {
    console.warn("BroadcastChannel error:", err);
  }

  // LocalStorage fallback for non-broadcast support
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function respondCallSignal(type: 'CALL_ACCEPTED' | 'CALL_DECLINED' | 'CALL_ENDED', doctorId: string, doctorName: string, patientName: string) {
  const payload: CallSignalPayload = {
    type,
    doctorId,
    doctorName,
    patientName,
    timestamp: Date.now(),
  };

  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch (err) {
    console.warn("BroadcastChannel error:", err);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function subscribeCallSignals(callback: (payload: CallSignalPayload) => void) {
  let bc: BroadcastChannel | null = null;

  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data && event.data.type) {
        callback(event.data as CallSignalPayload);
      }
    };
  } catch (err) {
    console.warn("BroadcastChannel error:", err);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue) as CallSignalPayload;
        callback(payload);
      } catch (err) {
        console.error("Storage parse error:", err);
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    bc?.close();
    window.removeEventListener('storage', handleStorage);
  };
}
