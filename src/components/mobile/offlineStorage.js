const LOCAL_CACHE_KEY = 'offline_cache';
const DB_NAME = 'ba_offline_cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

function hasWindow() {
  return typeof window !== 'undefined';
}

function hasIndexedDb() {
  return hasWindow() && typeof indexedDB !== 'undefined';
}

function getFilesystemPlugin() {
  if (!hasWindow()) return null;
  return window.Capacitor?.Plugins?.Filesystem || null;
}

function getNativeOptions() {
  const directory = window.Capacitor?.Plugins?.Filesystem?.Directory?.Data
    || window.Capacitor?.Directory?.Data
    || 'DATA';
  const encoding = window.Capacitor?.Plugins?.Filesystem?.Encoding?.UTF8
    || window.Capacitor?.Encoding?.UTF8
    || 'utf8';
  return { directory, encoding };
}

function buildNativePath(schoolId) {
  return `offline-cache-${schoolId || 'default'}.json`;
}

async function readNativeCache(schoolId) {
  const fs = getFilesystemPlugin();
  if (!fs) return null;
  try {
    const { directory, encoding } = getNativeOptions();
    const result = await fs.readFile({
      path: buildNativePath(schoolId),
      directory,
      encoding,
    });
    const data = result?.data ? JSON.parse(result.data) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

async function writeNativeCache(schoolId, items) {
  const fs = getFilesystemPlugin();
  if (!fs) return false;
  try {
    const { directory, encoding } = getNativeOptions();
    await fs.writeFile({
      path: buildNativePath(schoolId),
      directory,
      encoding,
      data: JSON.stringify(items || []),
    });
    return true;
  } catch (error) {
    return false;
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'school_id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readIndexedDbCache(schoolId) {
  if (!hasIndexedDb()) return null;
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(schoolId));
      req.onsuccess = () => resolve(req.result?.items || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function writeIndexedDbCache(schoolId, items) {
  if (!hasIndexedDb()) return false;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        school_id: String(schoolId),
        items: items || [],
        updated_at: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

function readLocalCache(schoolId) {
  if (!hasWindow()) return [];
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '[]');
    return cached.filter((item) => item.school_id === schoolId);
  } catch {
    return [];
  }
}

function writeLocalCache(schoolId, items) {
  if (!hasWindow()) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '[]');
    const filtered = cached.filter((item) => item.school_id !== schoolId);
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify([...filtered, ...(items || [])]));
    return true;
  } catch {
    return false;
  }
}

export async function loadOfflineCache(schoolId) {
  if (!schoolId) return [];
  const nativeItems = await readNativeCache(schoolId);
  if (nativeItems) return nativeItems;
  const indexedItems = await readIndexedDbCache(schoolId);
  if (indexedItems) return indexedItems;
  return readLocalCache(schoolId);
}

export async function saveOfflineCache(schoolId, items) {
  if (!schoolId) return false;
  const nativeSaved = await writeNativeCache(schoolId, items);
  if (nativeSaved) return true;
  const indexedSaved = await writeIndexedDbCache(schoolId, items);
  if (indexedSaved) return true;
  return writeLocalCache(schoolId, items);
}

export async function addOfflineCacheItem(schoolId, item) {
  if (!schoolId || !item?.id) return false;
  const existing = await loadOfflineCache(schoolId);
  const next = existing.filter((entry) => String(entry.id) !== String(item.id));
  next.push(item);
  return saveOfflineCache(schoolId, next);
}

export async function removeOfflineCacheItem(schoolId, itemId) {
  if (!schoolId || !itemId) return false;
  const existing = await loadOfflineCache(schoolId);
  const next = existing.filter((entry) => String(entry.id) !== String(itemId));
  return saveOfflineCache(schoolId, next);
}

export async function estimateOfflineStorage(schoolId, itemsOverride) {
  const items = Array.isArray(itemsOverride) ? itemsOverride : await loadOfflineCache(schoolId);
  const serialized = JSON.stringify(items || []);
  const usedKb = Math.round(serialized.length / 1024);
  let quotaKb = 5000;

  if (hasWindow() && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate?.quota) {
        quotaKb = Math.round(estimate.quota / 1024);
      }
    } catch {
      // ignore
    }
  }

  return { usedKb, quotaKb };
}
