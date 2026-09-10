import type { Meal } from './types'

const DB_NAME = 'health-camera'
const DB_VERSION = 1
const STORE = 'meals'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = fn(tx.objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function saveMeal(meal: Meal): Promise<void> {
  await withStore('readwrite', (store) => store.put(meal))
}

export async function deleteMeal(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id))
}

export async function getAllMeals(): Promise<Meal[]> {
  const meals = await withStore<Meal[]>('readonly', (store) => store.getAll())
  return meals.sort((a, b) => a.createdAt - b.createdAt)
}
