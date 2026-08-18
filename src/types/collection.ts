export interface CollectionItem {
  id: string;
  openingId?: string;
  name: string;
  eco: string;
  fen: string;
  moves: string[];
  note?: string;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}
