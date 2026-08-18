"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Collection, CollectionItem } from "@/types/collection";
import {
  getCollections,
  createCollection,
  deleteCollection,
  removeItemFromCollection,
  updateItemNote,
} from "@/lib/openings/collectionsService";
import { Folder, FolderPlus, BookOpen, Trash2, Edit3, Compass, ArrowRight, Plus, Check, FileText, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function CollectionsContent() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeColId, setActiveColId] = useState<string>("");
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [editedNoteText, setEditedNoteText] = useState("");

  // Create Collection modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState("#3fb950");

  useEffect(() => {
    const cols = getCollections();
    setCollections(cols);
    if (cols.length > 0 && !activeColId) {
      setActiveColId(cols[0].id);
    }
  }, [activeColId]);

  const activeCollection = collections.find((c) => c.id === activeColId) || collections[0];

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newColName.trim()) return;

    const created = createCollection(newColName.trim(), newColDesc.trim(), newColColor);
    const updated = getCollections();
    setCollections(updated);
    setActiveColId(created.id);
    setNewColName("");
    setNewColDesc("");
    setShowCreateModal(false);
  }

  function handleDeleteCollection(id: string) {
    if (confirm("Are you sure you want to delete this collection and all its saved prep lines?")) {
      deleteCollection(id);
      const updated = getCollections();
      setCollections(updated);
      if (updated.length > 0) {
        setActiveColId(updated[0].id);
      }
    }
  }

  function handleRemoveItem(itemId: string) {
    if (!activeCollection) return;
    removeItemFromCollection(activeCollection.id, itemId);
    setCollections(getCollections());
  }

  function handleSaveNote(itemId: string) {
    if (!activeCollection) return;
    updateItemNote(activeCollection.id, itemId, editedNoteText);
    setEditingNoteItemId(null);
    setCollections(getCollections());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <Folder className="w-8 h-8 text-brand-gold" />
            Preparation Collections
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize your opening repertoire lines, study variations, and tournament prep notes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-3 py-2 rounded-xl">
            <HardDrive className="w-4 h-4 shrink-0 text-brand-gold" />
            <span>Stored in your local browser storage</span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold hover:bg-brand/90 transition-colors flex items-center gap-2 shadow-md shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-surface rounded-2xl border border-surface-border space-y-3">
          <Folder className="w-12 h-12 mx-auto text-gray-500" />
          <p>You have no collections yet. Create one to organize your opening prep!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Collection Tabs Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 px-1">
              Your Collections ({collections.length})
            </h3>

            <div className="space-y-2">
              {collections.map((col) => {
                const isActive = col.id === activeColId;
                return (
                  <div
                    key={col.id}
                    onClick={() => setActiveColId(col.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all shadow-sm",
                      isActive
                        ? "border-brand-gold/60 bg-surface text-foreground shadow-md ring-1 ring-brand-gold/30"
                        : "border-surface-border bg-surface/50 hover:bg-surface hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: col.color || "#3fb950" }}
                      />
                      <div>
                        <h4 className="text-sm font-bold">{col.name}</h4>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {col.items.length} saved line{col.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowRight className={cn("w-4 h-4 transition-transform", isActive ? "text-brand-gold translate-x-1" : "text-gray-500 opacity-0 group-hover:opacity-100")} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Collection Content */}
          {activeCollection && (
            <div className="lg:col-span-8 space-y-6">
              {/* Active Collection Header */}
              <div className="flex items-center justify-between p-6 rounded-2xl border border-surface-border bg-surface shadow-md">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: activeCollection.color || "#3fb950" }}
                  />
                  <div>
                    <h2 className="text-xl font-extrabold text-foreground">{activeCollection.name}</h2>
                    {activeCollection.description && (
                      <p className="text-xs text-gray-400 mt-1">{activeCollection.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCollection(activeCollection.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                  title="Delete Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              {activeCollection.items.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400 bg-surface rounded-2xl border border-surface-border space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-gray-500" />
                  <p>No opening lines saved in this collection yet.</p>
                  <Link
                    href="/explorer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold hover:bg-brand/90 transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Openings to Add</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCollection.items.map((item) => {
                    const isEditingNote = editingNoteItemId === item.id;
                    const movesUrl = `/explorer?moves=${encodeURIComponent(item.moves.join(","))}`;

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-surface-border bg-surface hover:border-surface-border/80 transition-all space-y-3 shadow-md"
                      >
                        {/* Header line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-gold px-2.5 py-1 rounded bg-surface-muted border border-surface-border">
                              {item.eco}
                            </span>
                            <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={movesUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-mono font-bold hover:bg-brand-accent/20 transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Explore Line</span>
                            </Link>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-surface-muted transition-colors"
                              title="Remove from collection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Move Sequence */}
                        {item.moves && item.moves.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-surface-muted border border-surface-border/50 font-mono text-xs text-gray-300 flex flex-wrap gap-1.5">
                            {item.moves.map((m, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-background text-gray-200 border border-surface-border/50">
                                {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ""} {m}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Prep Note Section */}
                        <div className="pt-2 border-t border-surface-border/50">
                          {isEditingNote ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedNoteText}
                                onChange={(e) => setEditedNoteText(e.target.value)}
                                rows={3}
                                className="w-full p-3 rounded-xl border border-surface-border bg-background text-xs text-foreground focus:border-brand-accent focus:outline-none resize-none"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setEditingNoteItemId(null)}
                                  className="px-3 py-1 rounded-lg text-xs font-mono text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(item.id)}
                                  className="px-3 py-1 rounded-lg bg-brand text-white text-xs font-mono font-bold flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save Note</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3 group">
                              <div className="flex items-start gap-2 text-xs text-gray-300">
                                <FileText className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                                {item.note ? (
                                  <p className="leading-relaxed whitespace-pre-wrap">{item.note}</p>
                                ) : (
                                  <p className="text-gray-500 italic">No preparation note added yet.</p>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setEditingNoteItemId(item.id);
                                  setEditedNoteText(item.note || "");
                                }}
                                className="p-1 rounded text-gray-400 hover:text-white transition-colors shrink-0"
                                title="Edit Prep Note"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create New Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Create Repertoire Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sicilian Defense Repertoire"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border bg-background text-xs text-foreground focus:border-brand-accent focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Main lines against 1.e4 for Black"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border bg-background text-xs text-foreground focus:border-brand-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-xs font-mono text-gray-300 hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold disabled:opacity-40"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense } from "react";
import { LoadingSplash } from "@/components/brand/LoadingSplash";

export default function CollectionsPage() {
  return (
    <Suspense fallback={<LoadingSplash fullScreen={false} message="Loading Repertoire Collections..." />}>
      <CollectionsContent />
    </Suspense>
  );
}
