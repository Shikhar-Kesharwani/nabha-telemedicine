/**
 * Call Permission & Pre-Consultation Authorization Service
 * Tracks whether a doctor has reviewed the patient's pre-consultation chat & shared files
 * and granted call authorization for Video/Voice calls.
 */

const PERMISSIONS_STORAGE_KEY = 'sehat-call-permissions-map';
const CHANNEL_NAME = 'sehat-call-permission-channel';

interface PermissionMap {
  [key: string]: boolean; // key: `${doctorId}_${userId}`
}

function getPermissionMap(): PermissionMap {
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setPermissionMap(map: PermissionMap) {
  try {
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Permission storage write error:", e);
  }
}

export function isCallAllowedForPatient(doctorId: string, userId: string = '1'): boolean {
  const map = getPermissionMap();
  const key = `${doctorId}_${userId}`;
  return Boolean(map[key]);
}

export function grantCallPermission(doctorId: string, userId: string = '1') {
  const map = getPermissionMap();
  const key = `${doctorId}_${userId}`;
  map[key] = true;
  setPermissionMap(map);

  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ type: 'PERMISSION_GRANTED', doctorId, userId });
    bc.close();
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }
}

export function revokeCallPermission(doctorId: string, userId: string = '1') {
  const map = getPermissionMap();
  const key = `${doctorId}_${userId}`;
  delete map[key];
  setPermissionMap(map);
}

export function subscribeCallPermissions(callback: (map: PermissionMap) => void) {
  const check = () => callback(getPermissionMap());
  check();

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = () => check();
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === PERMISSIONS_STORAGE_KEY) {
      check();
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    bc?.close();
    window.removeEventListener('storage', handleStorage);
  };
}
