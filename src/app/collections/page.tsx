"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Collection, CollectionItem } from "@/types/collection";
import {
  getCollections,
  createCollection,
  deleteCollection,
  removeItemFromCollection,
  updateItemNote,
} from "@/lib/openings/collectionsService";
import {
  exportCollectionToPGN,
  downloadFile,
  exportAllToJSONBackup,
  importPgnTextToCollection,
  restoreJSONBackup,
} from "@/lib/chess/pgnService";
import {
  Folder,
  FolderPlus,
  BookOpen,
  Trash2,
  Edit3,
  Compass,
  ArrowRight,
  Plus,
  Check,
  FileText,
  HardDrive,
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeColId, setActiveColId] = useState<string>("");
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [editedNoteText, setEditedNoteText] = useState("");

  // Create Collection modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState("#3fb950");

  // Import / Restore modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPgnText, setImportPgnText] = useState("");
  const [importSuccessMsg, setImportSuccessMsg] = useState("");
  const [importErrorMsg, setImportErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  function handleExportPGN() {
    if (!activeCollection) return;
    const pgnString = exportCollectionToPGN(activeCollection);
    const sanitizedName = activeCollection.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    downloadFile(pgnString, `${sanitizedName}_repertoire.pgn`, "text/plain");
  }

  function handleImportPGN(e: React.FormEvent) {
    e.preventDefault();
    setImportSuccessMsg("");
    setImportErrorMsg("");

    if (!activeCollection || !importPgnText.trim()) return;

    const result = importPgnTextToCollection(importPgnText, activeCollection.id);
    if (result.importedCount > 0) {
      setImportSuccessMsg(`Successfully imported ${result.importedCount} study line(s) into ${activeCollection.name}!`);
      setImportPgnText("");
      setCollections(getCollections());
      setTimeout(() => setShowImportModal(false), 2000);
    } else {
      setImportErrorMsg("Could not parse any valid PGN games. Please check your PGN format.");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      if (file.name.endsWith(".json")) {
        const success = restoreJSONBackup(text);
        if (success) {
          const updated = getCollections();
          setCollections(updated);
          if (updated.length > 0) setActiveColId(updated[0].id);
          setImportSuccessMsg("Successfully restored JSON repertoire backup!");
          setTimeout(() => setShowImportModal(false), 2000);
        } else {
          setImportErrorMsg("Invalid JSON backup file format.");
        }
      } else {
        setImportPgnText(text);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <Folder className="w-8 h-8 text-brand-gold" />
            Preparation Collections & Backup
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize, study, export, and backup your opening repertoire lines (PGN / JSON)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => exportAllToJSONBackup()}
            className="px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-surface-border text-xs font-mono font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2 shadow-sm"
            title="Download full JSON backup of all collections"
          >
            <Download className="w-4 h-4 text-brand-gold" />
            <span>Backup All (JSON)</span>
          </button>

          <button
            onClick={() => {
              setImportSuccessMsg("");
              setImportErrorMsg("");
              setShowImportModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-surface-border text-xs font-mono font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4 text-brand-accent" />
            <span>Import PGN / Restore</span>
          </button>

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-surface-border bg-surface shadow-md">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPGN}
                    disabled={activeCollection.items.length === 0}
                    className="px-3 py-1.5 rounded-xl border border-brand-accent/40 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 disabled:opacity-40 disabled:hover:bg-brand-accent/10 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                    title="Export collection as PGN file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PGN</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCollection(activeCollection.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Move sequence preview */}
                        {item.moves && item.moves.length > 0 && (
                          <div className="p-2.5 rounded-xl border border-surface-border bg-surface-muted font-mono text-xs text-brand-gold break-words">
                            {item.moves.join(" ")}
                          </div>
                        )}

                        {/* Note area */}
                        <div className="pt-2 border-t border-surface-border/60">
                          {isEditingNote ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedNoteText}
                                onChange={(e) => setEditedNoteText(e.target.value)}
                                placeholder="Add notes, ideas, or tactical key points..."
                                className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-brand-accent font-sans"
                                rows={2}
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
                                  className="px-3 py-1 rounded-lg bg-brand-accent text-black font-mono font-bold text-xs hover:bg-brand-accent-hover"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3 text-xs">
                              <p className="text-gray-400 italic">
                                {item.note ? `Note: ${item.note}` : "No custom note added."}
                              </p>
                              <button
                                onClick={() => {
                                  setEditingNoteItemId(item.id);
                                  setEditedNoteText(item.note || "");
                                }}
                                className="text-gray-500 hover:text-brand-accent flex items-center gap-1 font-mono text-[11px] shrink-0"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit Note</span>
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

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl border border-surface-border bg-surface shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-brand-gold" />
                <span>Create Preparation Collection</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Sicilian Dragon Prep"
                  className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted text-xs text-foreground focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400">Description (Optional)</label>
                <input
                  type="text"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="e.g. Yugoslav Attack main line variations"
                  className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted text-xs text-foreground focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400">Color Tag</label>
                <div className="flex items-center gap-3">
                  {["#3fb950", "#a371f7", "#d29922", "#f85149", "#58a6ff"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={cn(
                        "w-7 h-7 rounded-full transition-transform border-2",
                        newColColor === c ? "scale-110 border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand text-white font-mono font-bold text-xs hover:bg-brand/90 shadow-md"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import PGN & Restore JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-surface-border bg-surface shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-accent" />
                <span>Import PGN / Restore Backup</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importSuccessMsg && (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {importErrorMsg && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importErrorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* File Upload Trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-accent/50 bg-surface-muted/50 cursor-pointer text-center space-y-2 transition-colors"
              >
                <FileCode className="w-8 h-8 mx-auto text-brand-accent" />
                <p className="text-xs font-mono font-bold text-gray-200">Click to upload .PGN or .JSON backup file</p>
                <p className="text-[11px] text-gray-400">Supports standard PGN files & ChessOp JSON backups</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pgn,.json"
                  className="hidden"
                />
              </div>

              {/* Paste Raw PGN Input */}
              <form onSubmit={handleImportPGN} className="space-y-3">
                <label className="text-xs font-mono text-gray-400">Or Paste PGN Text Directly:</label>
                <textarea
                  value={importPgnText}
                  onChange={(e) => setImportPgnText(e.target.value)}
                  placeholder={`[Event "Sicilian Defense"]\n1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *`}
                  className="w-full p-3 rounded-xl border border-surface-border bg-surface-muted text-xs font-mono text-foreground placeholder-gray-500 focus:outline-none focus:border-brand-accent"
                  rows={4}
                />

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!importPgnText.trim()}
                    className="px-4 py-2 rounded-xl bg-brand-accent text-black font-mono font-bold text-xs hover:bg-brand-accent-hover disabled:opacity-40 shadow-md"
                  >
                    Import PGN to {activeCollection?.name || "Collection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
