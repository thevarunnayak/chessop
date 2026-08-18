"use client";

import { useState, useEffect } from "react";
import { Collection } from "@/types/collection";
import { getCollections, createCollection, addItemToCollections } from "@/lib/openings/collectionsService";
import { FolderPlus, Bookmark, Plus, Check, X, FileText, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  openingData: {
    openingId?: string;
    name: string;
    eco: string;
    fen: string;
    moves: string[];
  };
}

const COLOR_OPTIONS = ["#3fb950", "#a371f7", "#d29922", "#58a6ff", "#f85149"];

export function AddToCollectionModal({ isOpen, onClose, openingData }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedColIds, setSelectedColIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState("#3fb950");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cols = getCollections();
      setCollections(cols);
      // Pre-select first collection if none selected
      if (cols.length > 0) {
        setSelectedColIds([cols[0].id]);
      }
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleCollection(id: string) {
    if (selectedColIds.includes(id)) {
      setSelectedColIds(selectedColIds.filter((colId) => colId !== id));
    } else {
      setSelectedColIds([...selectedColIds, id]);
    }
  }

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newColName.trim()) return;

    const created = createCollection(newColName.trim(), newColDesc.trim(), newColColor);
    const updatedCols = getCollections();
    setCollections(updatedCols);
    setSelectedColIds((prev) => [...prev, created.id]);
    setNewColName("");
    setNewColDesc("");
    setIsCreatingNew(false);
  }

  function handleSave() {
    if (selectedColIds.length === 0) return;

    addItemToCollections(selectedColIds, {
      openingId: openingData.openingId,
      name: openingData.name,
      eco: openingData.eco,
      fen: openingData.fen,
      moves: openingData.moves,
      note: note.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface shadow-2xl p-6 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand-accent border border-brand/40">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Save to Repertoire Collection</h3>
              <p className="text-xs text-gray-400 font-mono">
                {openingData.eco} • {openingData.name}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-lg">
            <HardDrive className="w-3 h-3 text-brand-gold shrink-0" />
            <span>Local Storage</span>
          </div>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-foreground">Added to Collection!</h4>
            <p className="text-xs text-gray-400">Opening line and prep note saved to your repertoire.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select Collections Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                  Target Collections
                </label>
                <button
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-brand-accent hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isCreatingNew ? "Cancel" : "New Collection"}
                </button>
              </div>

              {/* Create New Inline Form */}
              {isCreatingNew && (
                <form onSubmit={handleCreateCollection} className="p-3 rounded-xl bg-surface-muted border border-surface-border space-y-3">
                  <input
                    type="text"
                    placeholder="Collection Name (e.g. Sicilian Defense Prep)..."
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-surface-border bg-background text-xs text-foreground placeholder-gray-500 focus:border-brand-accent focus:outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Optional Description..."
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-surface-border bg-background text-xs text-foreground placeholder-gray-500 focus:border-brand-accent focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-400">Color:</span>
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewColColor(c)}
                          className={cn(
                            "w-5 h-5 rounded-full transition-transform",
                            newColColor === c ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={!newColName.trim()}
                      className="px-3 py-1 rounded-lg bg-brand text-white text-xs font-mono font-semibold disabled:opacity-40"
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}

              {/* List of Collections */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {collections.map((col) => {
                  const isChecked = selectedColIds.includes(col.id);
                  return (
                    <div
                      key={col.id}
                      onClick={() => toggleCollection(col.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                        isChecked
                          ? "border-brand-accent/60 bg-brand/10 text-foreground"
                          : "border-surface-border bg-surface-muted/50 hover:bg-surface-hover text-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: col.color || "#3fb950" }}
                        />
                        <div>
                          <p className="text-xs font-bold">{col.name}</p>
                          {col.description && <p className="text-[10px] text-gray-400 truncate max-w-[240px]">{col.description}</p>}
                        </div>
                      </div>

                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                        isChecked ? "border-brand-accent bg-brand text-white" : "border-surface-border"
                      )}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preparation Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-gold" />
                <span>Preparation Note</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add tournament notes (e.g., 'Main weapon against 1.e4. Watch out for 4.d4! Key plan: control d5 square.')"
                rows={3}
                className="w-full p-3 rounded-xl border border-surface-border bg-background text-xs text-foreground placeholder-gray-500 focus:border-brand-accent focus:outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-surface-border bg-surface-muted text-xs font-mono font-semibold text-gray-300 hover:text-white hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedColIds.length === 0}
                className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold hover:bg-brand/90 disabled:opacity-40 transition-colors flex items-center gap-2 shadow-md"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Save Note & Line</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
