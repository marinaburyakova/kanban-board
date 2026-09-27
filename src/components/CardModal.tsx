"use client";

import { useEffect, useRef, useState } from "react";
import type { Card, ColumnId } from "@/lib/kanban";
import Button from "./Button";
import styles from "./CardModal.module.css";

type CardModalProps = {
  columnId: ColumnId;
  columnTitle: string;
  initialData?: Card;
  onClose: () => void;
  onSubmit: (data: {
    company: string;
    position: string;
    url?: string;
    salary?: string;
    notes?: string;
  }) => void;
};

type FormState = {
  company: string;
  position: string;
  url: string;
  salary: string;
  notes: string;
};

export default function CardModal({
  initialData,
  onClose,
  onSubmit,
}: CardModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isEdit = initialData !== undefined;

  const [form, setForm] = useState<FormState>(() => ({
    company: initialData?.company ?? "",
    position: initialData?.position ?? "",
    url: initialData?.url ?? "",
    salary: initialData?.salary ?? "",
    notes: initialData?.notes ?? "",
  }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    firstInputRef.current?.focus();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedCompany = form.company.trim();
    const trimmedPosition = form.position.trim();

    if (!trimmedCompany) {
      setError("Company is required");
      return;
    }
    if (!trimmedPosition) {
      setError("Position is required");
      return;
    }
    if (form.url && !isValidUrl(form.url)) {
      setError("Invalid URL");
      return;
    }

    onSubmit({
      company: trimmedCompany,
      position: trimmedPosition,
      url: form.url.trim() || undefined,
      salary: form.salary.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit card" : "Add card"}</h2>
        </header>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Company *</span>
            <input
              ref={firstInputRef}
              type="text"
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
              placeholder="e.g. Vercel"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Position *</span>
            <input
              type="text"
              value={form.position}
              onChange={(e) => updateField("position", e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>URL</span>
            <input
              type="url"
              value={form.url}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Salary</span>
            <input
              type="text"
              value={form.salary}
              onChange={(e) => updateField("salary", e.target.value)}
              placeholder="e.g. $100k–130k"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any notes…"
              className={styles.textarea}
              rows={3}
            />
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save" : "Add card"}</Button>
        </footer>
      </form>
    </dialog>
  );
}

function isValidUrl(str: string): boolean {
  if (str.length > 2048) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
