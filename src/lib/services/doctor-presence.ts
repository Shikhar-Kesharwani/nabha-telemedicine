/**
 * Realtime Doctor Presence & Online Status Tracking Service
 * Tracks which doctors are actively logged into their doctor portal.
 */

const PRESENCE_CHANNEL = 'sehat-doctor-presence';
const PRESENCE_STORAGE_KEY = 'sehat-online-doctors-map';

interface DoctorPresenceMap {
  [doctorId: string]: number; // doctorId -> lastHeartbeatTimestamp
}

function getPresenceMap(): DoctorPresenceMap {
  try {
    const raw = localStorage.getItem(PRESENCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setPresenceMap(map: DoctorPresenceMap) {
  try {
    localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Storage write error:", e);
  }
}

export function broadcastDoctorOnline(doctorId: string) {
  const updateMap = () => {
    const map = getPresenceMap();
    const now = Date.now();
    
    // Purge stale entries (> 15 seconds without heartbeat)
    Object.keys(map).forEach((id) => {
      if (now - map[id] > 15000) {
        delete map[id];
      }
    });

    map[doctorId] = now;
    setPresenceMap(map);

    try {
      const bc = new BroadcastChannel(PRESENCE_CHANNEL);
      bc.postMessage({ type: 'PRESENCE_HEARTBEAT', activeDoctors: Object.keys(map) });
      bc.close();
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
  };

  updateMap();
  const interval = setInterval(updateMap, 5000);

  return () => {
    clearInterval(interval);
  };
}

export function getActiveOnlineDoctorIds(): string[] {
  const map = getPresenceMap();
  const now = Date.now();
  const activeIds: string[] = [];

  Object.keys(map).forEach((id) => {
    if (now - map[id] <= 15000) {
      activeIds.push(id);
    }
  });

  return activeIds;
}

export function subscribeOnlineDoctors(callback: (onlineDoctorIds: string[]) => void) {
  const check = () => {
    callback(getActiveOnlineDoctorIds());
  };

  check();

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(PRESENCE_CHANNEL);
    bc.onmessage = () => check();
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === PRESENCE_STORAGE_KEY) {
      check();
    }
  };

  window.addEventListener('storage', handleStorage);
  const interval = setInterval(check, 3000);

  return () => {
    bc?.close();
    window.removeEventListener('storage', handleStorage);
    clearInterval(interval);
  };
}
