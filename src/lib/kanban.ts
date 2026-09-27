export type ColumnId =
  "wishlist" | "applied" | "interview" | "offer" | "rejected";

export type Column = {
  id: ColumnId;
  title: string;
  cardIds: string[];
};

export type Card = {
  id: string;
  columnId: ColumnId;
  company: string;
  position: string;
  url?: string;
  salary?: string;
  notes?: string;
  createdAt: string;
};

export type Board = {
  columns: Column[];
  cards: Card[];
};

export const INITIAL_COLUMNS: Column[] = [
  { id: "wishlist", title: "Wishlist", cardIds: [] },
  { id: "applied", title: "Applied", cardIds: [] },
  { id: "interview", title: "Interview", cardIds: [] },
  { id: "offer", title: "Offer", cardIds: [] },
  { id: "rejected", title: "Rejected", cardIds: [] },
];
export const INITIAL_BOARD: Board = {
  columns: INITIAL_COLUMNS,
  cards: [],
};

// Утилиты
// ─────────────────────────────────────────

export function getToday(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─────────────────────────────────────────
// Создание
// ─────────────────────────────────────────

export type CreateCardInput = {
  columnId: ColumnId;
  company: string;
  position: string;
  url?: string;
  salary?: string;
  notes?: string;
};
function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.length > 2048) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

export function createCard(input: CreateCardInput): Card {
  return {
    id: crypto.randomUUID(),
    columnId: input.columnId,
    company: input.company,
    position: input.position,
    url: sanitizeUrl(input.url),
    salary: input.salary,
    notes: input.notes,
    createdAt: getToday(),
  };
}
// ─────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────

export function addCard(board: Board, card: Card): Board {
  return {
    ...board,
    cards: [...board.cards, card],
    columns: board.columns.map((col) =>
      col.id === card.columnId
        ? { ...col, cardIds: [...col.cardIds, card.id] }
        : col
    ),
  };
}

export function removeCard(board: Board, cardId: string): Board {
  return {
    ...board,
    cards: board.cards.filter((c) => c.id !== cardId),
    columns: board.columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    })),
  };
}

export function moveCard(
  board: Board,
  cardId: string,
  toColumnId: ColumnId,
  toIndex: number
): Board {
  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return board;

  const fromColumnId = card.columnId;

  return {
    ...board,
    columns: board.columns.map((col) => {
      // Случай A: та же колонка
      if (col.id === fromColumnId && col.id === toColumnId) {
        const fromIndex = col.cardIds.indexOf(cardId);
        const without = col.cardIds.filter((id) => id !== cardId);
        const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex;
        const next = [...without];
        next.splice(adjusted, 0, cardId);
        return { ...col, cardIds: next };
      }
      // Случай B: исходная колонка
      if (col.id === fromColumnId) {
        return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
      }
      // Случай B: целевая колонка
      if (col.id === toColumnId) {
        const next = [...col.cardIds];
        next.splice(toIndex, 0, cardId);
        return { ...col, cardIds: next };
      }
      return col;
    }),
    cards: board.cards.map((c) =>
      c.id === cardId ? { ...c, columnId: toColumnId } : c
    ),
  };
}

// ─────────────────────────────────────────
// Чтение
// ─────────────────────────────────────────

export function getCardsInColumn(board: Board, columnId: ColumnId): Card[] {
  const column = board.columns.find((c) => c.id === columnId);
  if (!column) return [];

  return column.cardIds
    .map((id) => board.cards.find((c) => c.id === id))
    .filter((c): c is Card => c !== undefined);
}

export function getColumnStats(board: Board, columnId: ColumnId) {
  return {
    count: getCardsInColumn(board, columnId).length,
  };
}

export function createSampleBoard(): Board {
  const seedCards = [
    {
      id: "seed-vercel",
      columnId: "applied",
      company: "Vercel",
      position: "Frontend Engineer",
      createdAt: "2026-09-23",
      url: "https://vercel.com/careers",
    },
    {
      id: "seed-linear",
      columnId: "applied",
      company: "Linear",
      position: "Fullstack Developer",
      createdAt: "2026-09-23",
      url: "https://linear.app/careers",
    },
    {
      id: "seed-stripe",
      columnId: "interview",
      company: "Stripe",
      position: "Backend Engineer",
      salary: "$120k–160k",
      createdAt: "2026-09-23",
    },
    {
      id: "seed-figma",
      columnId: "offer",
      company: "Figma",
      position: "Frontend Engineer",
      createdAt: "2026-09-23",
    },
    {
      id: "seed-meta",
      columnId: "rejected",
      company: "Meta",
      position: "React Developer",
      notes: "Rejected after tech screen",
      createdAt: "2026-09-23",
    },
  ] satisfies Card[];

  let board: Board = {
    columns: INITIAL_COLUMNS.map((c) => ({ ...c, cardIds: [] })),
    cards: [],
  };

  seedCards.forEach((card) => {
    board = addCard(board, card);
  });

  return board;
}

export type UpdateCardInput = {
  company?: string;
  position?: string;
  url?: string;
  salary?: string;
  notes?: string;
};
export function updateCard(
  board: Board,
  cardId: string,
  data: UpdateCardInput
): Board {
  const sanitized: UpdateCardInput = {
    ...data,
    url: sanitizeUrl(data.url),
  };
  return {
    ...board,
    cards: board.cards.map((c) =>
      c.id === cardId ? { ...c, ...sanitized } : c
    ),
  };
}

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
