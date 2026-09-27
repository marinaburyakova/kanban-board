"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  Column as ColumnType,
  Card as CardType,
  ColumnId,
} from "@/lib/kanban";
import Card from "./Card";
import CardModal from "./CardModal";
import styles from "./Column.module.css";

type ColumnProps = {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (
    columnId: ColumnId,
    data: {
      company: string;
      position: string;
      url?: string;
      salary?: string;
      notes?: string;
    }
  ) => void;
  onUpdateCard: (
    cardId: string,
    data: {
      company: string;
      position: string;
      url?: string;
      salary?: string;
      notes?: string;
    }
  ) => void;
  onRemoveCard: (cardId: string) => void;
  onMoveCard: (cardId: string, toColumnId: ColumnId, toIndex: number) => void;
};

type ModalState =
  { mode: "closed" } | { mode: "create" } | { mode: "edit"; card: CardType };

export default function Column({
  column,
  cards,
  onAddCard,
  onUpdateCard,
  onRemoveCard,
  onMoveCard,
}: ColumnProps) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function closeModal() {
    setModal({ mode: "closed" });
  }

  return (
    <div className={styles.column} data-column-id={column.id}>
      <header className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <span className={styles.count}>{cards.length}</span>
      </header>

      <div
        ref={setNodeRef}
        className={`${styles.cards} ${isOver ? styles.cardsOver : ""}`}
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onRemove={onRemoveCard}
              onEdit={(c) => setModal({ mode: "edit", card: c })}
              onMove={onMoveCard}
            />
          ))}
        </SortableContext>
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => setModal({ mode: "create" })}
      >
        + Add card
      </button>

      {modal.mode === "create" && (
        <CardModal
          onClose={closeModal}
          onSubmit={(data) => onAddCard(column.id, data)}
          columnId={column.id}
          columnTitle={column.title}
        />
      )}

      {modal.mode === "edit" && (
        <CardModal
          initialData={modal.card}
          onClose={closeModal}
          onSubmit={(data) => onUpdateCard(modal.card.id, data)}
          columnId={column.id}
          columnTitle={column.title}
        />
      )}
    </div>
  );
}
