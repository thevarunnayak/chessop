"use client";

import { Collection, CollectionItem } from "@/types/collection";

const STORAGE_KEY = "chessop_collections_v1";

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: "white-prep",
    name: "White Repertoire",
    description: "Opening preparation and study lines for White",
    color: "#3fb950",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "black-prep",
    name: "Black Repertoire",
    description: "Defensive weapons and counter-play lines for Black",
    color: "#a371f7",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "favorites",
    name: "Favorites",
    description: "Favorite openings and interesting gambits",
    color: "#d29922",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return DEFAULT_COLLECTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COLLECTIONS));
      return DEFAULT_COLLECTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COLLECTIONS;
  }
}

export function saveCollections(collections: Collection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch {
    // Ignore storage errors
  }
}

export function createCollection(name: string, description?: string, color: string = "#3fb950"): Collection {
  const collections = getCollections();
  const newCol: Collection = {
    id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: description || "",
    color,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  collections.push(newCol);
  saveCollections(collections);
  return newCol;
}

export function deleteCollection(id: string): void {
  const collections = getCollections().filter((c) => c.id !== id);
  saveCollections(collections);
}

export function addItemToCollections(
  collectionIds: string[],
  itemData: Omit<CollectionItem, "id" | "addedAt">
): void {
  const collections = getCollections();

  for (const col of collections) {
    if (collectionIds.includes(col.id)) {
      // Check if item already exists by FEN or openingId
      const existingIdx = col.items.findIndex(
        (i) => (itemData.openingId && i.openingId === itemData.openingId) || i.fen === itemData.fen
      );

      const newItem: CollectionItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        addedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        // Update existing item with new note/details
        col.items[existingIdx] = {
          ...col.items[existingIdx],
          note: itemData.note || col.items[existingIdx].note,
        };
      } else {
        col.items.push(newItem);
      }

      col.updatedAt = new Date().toISOString();
    }
  }

  saveCollections(collections);
}

export function removeItemFromCollection(collectionId: string, itemId: string): void {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (col) {
    col.items = col.items.filter((i) => i.id !== itemId);
    col.updatedAt = new Date().toISOString();
    saveCollections(collections);
  }
}

export function updateItemNote(collectionId: string, itemId: string, newNote: string): void {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (col) {
    const item = col.items.find((i) => i.id === itemId);
    if (item) {
      item.note = newNote;
      col.updatedAt = new Date().toISOString();
      saveCollections(collections);
    }
  }
}
