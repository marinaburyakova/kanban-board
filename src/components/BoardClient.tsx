"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  INITIAL_BOARD,
  createSampleBoard,
  addCard,
  removeCard,
  moveCard,
  updateCard,
  createCard,
  getCardsInColumn,
  type Board,
  type ColumnId,
} from "@/lib/kanban";
import Column from "./Column";
import styles from "./BoardClient.module.css";

const STORAGE_KEY = "kanban-board-v1";

function loadBoard(): Board {
  if (typeof window === "undefined") return INITIAL_BOARD;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSampleBoard();
    return JSON.parse(saved) as Board;
  } catch {
    return createSampleBoard();
  }
}

export default function BoardClient() {
  const [board, setBoard] = useState<Board>(() => loadBoard());

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
      } catch (e) {
        console.error("Failed to save board:", e);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = board.cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    const columnIds = new Set(board.columns.map((c) => c.id));

    let toColumnId: ColumnId;
    let toIndex: number;

    if (columnIds.has(overId as ColumnId)) {
      toColumnId = overId as ColumnId;
      const targetColumn = board.columns.find((c) => c.id === toColumnId);
      if (!targetColumn) return;
      toIndex = targetColumn.cardIds.length;
    } else {
      const overCard = board.cards.find((c) => c.id === overId);
      if (!overCard) return;
      toColumnId = overCard.columnId;
      const targetColumn = board.columns.find((c) => c.id === toColumnId);
      if (!targetColumn) return;
      toIndex = targetColumn.cardIds.indexOf(overId);
    }

    setBoard((prev) => moveCard(prev, activeId, toColumnId, toIndex));
  }
  function handleAddCard(
    columnId: ColumnId,
    data: {
      company: string;
      position: string;
      url?: string;
      salary?: string;
      notes?: string;
    }
  ) {
    const card = createCard({ columnId, ...data });
    setBoard((prev) => addCard(prev, card));
  }

  function handleUpdateCard(
    cardId: string,
    data: {
      company: string;
      position: string;
      url?: string;
      salary?: string;
      notes?: string;
    }
  ) {
    setBoard((prev) => updateCard(prev, cardId, data));
  }

  function handleRemoveCard(cardId: string) {
    setBoard((prev) => removeCard(prev, cardId));
  }

  function handleMoveCard(
    cardId: string,
    toColumnId: ColumnId,
    toIndex: number
  ) {
    setBoard((prev) => moveCard(prev, cardId, toColumnId, toIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      autoScroll={{ enabled: true }}
    >
      <div className={styles.board}>
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={getCardsInColumn(board, column.id)}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onRemoveCard={handleRemoveCard}
            onMoveCard={handleMoveCard}
          />
        ))}
      </div>
    </DndContext>
  );
}
