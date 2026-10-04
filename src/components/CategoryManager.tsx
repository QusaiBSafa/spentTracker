"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory, deleteCategory, renameCategory } from "@/app/category-actions";
import Modal from "./Modal";

type Category = { id: string; name: string; expenseCount: number };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string>();
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string>();

  function add(e: React.FormEvent) {
    e.preventDefault();
    setAddError(undefined);
    startTransition(async () => {
      const res = await createCategory(newName);
      if (res.error) return setAddError(res.error);
      setNewName("");
      router.refresh();
    });
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditError(undefined);
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    startTransition(async () => {
      const res = await renameCategory(editingId, editName);
      if (res.error) return setEditError(res.error);
      setEditingId(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    setDeleteError(undefined);
    startTransition(async () => {
      const res = await deleteCategory(deleting.id);
      if (res.error) return setDeleteError(res.error);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <h1 className="text-lg font-semibold">Categories</h1>
      <p className="text-sm text-gray-500 mt-1">These are the options you pick from when adding spending.</p>

      <form onSubmit={add} className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category, e.g. Coffee"
          maxLength={40}
          className="input"
          aria-label="New category name"
        />
        <button disabled={pending || !newName.trim()} className="btn-primary shrink-0">
          Add
        </button>
      </form>
      {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}

      <ul className="mt-5 divide-y">
        {categories.length === 0 && <li className="py-6 text-center text-sm text-gray-500">No categories yet.</li>}
        {categories.map((c) =>
          editingId === c.id ? (
            <li key={c.id} className="py-3">
              <form onSubmit={saveEdit} className="flex gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={40}
                  autoFocus
                  className="input"
                  aria-label={`Rename ${c.name}`}
                />
                <button disabled={pending} className="btn-primary shrink-0">
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="btn-secondary shrink-0">
                  Cancel
                </button>
              </form>
              {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
            </li>
          ) : (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-xs text-gray-500">
                {c.expenseCount} {c.expenseCount === 1 ? "entry" : "entries"}
              </span>
              <button
                onClick={() => startEdit(c)}
                className="rounded-lg px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setDeleteError(undefined);
                  setDeleting(c);
                }}
                className="rounded-lg px-2.5 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ),
        )}
      </ul>

      {deleting && (
        <Modal title={`Delete "${deleting.name}"?`} onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600">
            {deleting.expenseCount > 0 ? (
              <>
                This will also delete the <strong>{deleting.expenseCount}</strong> spending{" "}
                {deleting.expenseCount === 1 ? "entry" : "entries"} recorded under it. This can&apos;t be undone.
              </>
            ) : (
              "No spending is recorded under this category."
            )}
          </p>
          {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDeleting(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
