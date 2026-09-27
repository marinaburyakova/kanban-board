import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType, ColumnId } from "@/lib/kanban";
import { isSafeUrl } from "@/lib/kanban";
import Button from "./Button";
import styles from "./Card.module.css";

type CardProps = {
  card: CardType;
  onRemove: (cardId: string) => void;
  onEdit: (card: CardType) => void;
  onMove: (cardId: string, toColumnId: ColumnId, toIndex: number) => void;
};

export default function Card({ card, onRemove, onEdit }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleEdit() {
    onEdit(card);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onRemove(card.id);
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={styles.card}
      data-card-id={card.id}
      onClick={handleEdit}
      {...attributes}
      {...listeners}
    >
      <div className={styles.header}>
        <h3 className={styles.company}>{card.company}</h3>
        <Button
          variant="danger"
          onClick={handleRemove}
          ariaLabel={`Delete ${card.company} card`}
        >
          <span aria-hidden="true">&times;</span>
        </Button>
      </div>

      <p className={styles.position}>{card.position}</p>

      {card.salary && <p className={styles.salary}>{card.salary}</p>}

      {card.url && isSafeUrl(card.url) && (
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          onClick={(e) => e.stopPropagation()}
        >
          View posting
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}

      {card.notes && <p className={styles.notes}>{card.notes}</p>}
    </article>
  );
}
