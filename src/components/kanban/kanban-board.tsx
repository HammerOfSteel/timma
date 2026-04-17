'use client';

import { useState, useRef, useTransition } from 'react';
import { ActivityVisual } from '@/components/schedule/activity-visual';
import {
  createKanbanCard,
  deleteKanbanCard,
  moveKanbanCard,
  createKanbanColumn,
  deleteKanbanColumn,
} from '@/app/actions/kanban';

interface CardData {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  symbol: { name: string; imageUrl: string } | null;
  imageUrl: string | null;
  activity: { id: string; title: string } | null;
}

interface ColumnData {
  id: string;
  title: string;
  color: string;
  sortOrder: number;
  cards: CardData[];
}

interface KanbanBoardProps {
  boardId: string;
  boardName: string;
  columns: ColumnData[];
}

const CARD_COLORS = [
  '#ef4444', '#f97316', '#fbbf24', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

export function KanbanBoard({ boardId, boardName, columns }: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; sourceColumnId: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ columnId: string; index: number } | null>(null);
  const [addingCardInColumn, setAddingCardInColumn] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const newCardTitleRef = useRef<HTMLInputElement>(null);
  const newColumnTitleRef = useRef<HTMLInputElement>(null);

  // ─── Drag and Drop ─────────────────────────────────────────────────

  function handleDragStart(cardId: string, sourceColumnId: string) {
    setDraggedCard({ cardId, sourceColumnId });
  }

  function handleDragOver(e: React.DragEvent, columnId: string, cardIndex: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ columnId, index: cardIndex });
  }

  function handleColumnDragOver(e: React.DragEvent, columnId: string, cardCount: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ columnId, index: cardCount });
  }

  function handleDrop(e: React.DragEvent, targetColumnId: string, targetIndex: number) {
    e.preventDefault();
    if (!draggedCard) return;

    startTransition(() => {
      moveKanbanCard(draggedCard.cardId, targetColumnId, targetIndex);
    });

    setDraggedCard(null);
    setDropTarget(null);
  }

  function handleDragEnd() {
    setDraggedCard(null);
    setDropTarget(null);
  }

  // ─── Card CRUD ─────────────────────────────────────────────────────

  function handleAddCard(columnId: string) {
    setAddingCardInColumn(columnId);
    setTimeout(() => newCardTitleRef.current?.focus(), 50);
  }

  function handleSubmitCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      createKanbanCard(formData);
    });
    setAddingCardInColumn(null);
  }

  function handleDeleteCard(cardId: string) {
    startTransition(() => {
      deleteKanbanCard(cardId);
    });
  }

  // ─── Column CRUD ───────────────────────────────────────────────────

  function handleAddColumn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = newColumnTitleRef.current?.value?.trim();
    if (!title) return;
    startTransition(() => {
      createKanbanColumn(boardId, title);
    });
    setShowAddColumn(false);
  }

  function handleDeleteColumn(columnId: string) {
    if (!confirm('Ta bort kolumnen och alla dess kort?')) return;
    startTransition(() => {
      deleteKanbanColumn(columnId);
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Loading bar */}
      {isPending && (
        <div className="flex justify-center py-1">
          <div className="h-1 w-24 animate-pulse rounded-full bg-indigo-400" />
        </div>
      )}

      {/* Columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50"
            onDragOver={(e) => handleColumnDragOver(e, column.id, column.cards.length)}
            onDrop={(e) => handleDrop(e, column.id, column.cards.length)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <span className="rounded-full bg-gray-200 px-1.5 text-[10px] font-medium text-gray-600">
                  {column.cards.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAddCard(column.id)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  title="Lägg till kort"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {columns.length > 1 && (
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Ta bort kolumn"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
              {column.cards.map((card, cardIdx) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id, column.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, column.id, cardIdx)}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, column.id, cardIdx);
                  }}
                  className={`group cursor-grab rounded-lg border bg-white p-3 shadow-sm transition active:cursor-grabbing ${
                    draggedCard?.cardId === card.id ? 'opacity-40' : ''
                  } ${
                    dropTarget?.columnId === column.id && dropTarget?.index === cardIdx
                      ? 'border-indigo-400 ring-1 ring-indigo-300'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow'
                  }`}
                >
                  {/* Color strip */}
                  {card.color && (
                    <div
                      className="-mx-3 -mt-3 mb-2 h-1 rounded-t-lg"
                      style={{ backgroundColor: card.color }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <ActivityVisual symbol={card.symbol} imageUrl={card.imageUrl} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{card.title}</p>
                        {card.description && (
                          <p className="mt-0.5 text-xs text-gray-500">{card.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                      title="Ta bort"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Linked activity badge */}
                  {card.activity && (
                    <div className="mt-2 flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5">
                      <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-medium text-indigo-600">
                        {card.activity.title}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add card form */}
              {addingCardInColumn === column.id && (
                <form onSubmit={handleSubmitCard} className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm">
                  <input type="hidden" name="columnId" value={column.id} />
                  <input
                    ref={newCardTitleRef}
                    name="title"
                    type="text"
                    required
                    placeholder="Korttitel..."
                    className="w-full rounded border-0 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <input
                    name="description"
                    type="text"
                    placeholder="Beskrivning (valfritt)"
                    className="mt-1 w-full rounded border-0 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      {CARD_COLORS.slice(0, 6).map((c) => (
                        <label key={c} className="cursor-pointer">
                          <input type="radio" name="color" value={c} className="peer sr-only" />
                          <div
                            className="h-4 w-4 rounded-full border-2 border-transparent transition peer-checked:border-gray-800"
                            style={{ backgroundColor: c }}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAddingCardInColumn(null)}
                        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        Avbryt
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Lägg till
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {column.cards.length === 0 && addingCardInColumn !== column.id && (
                <p className="py-6 text-center text-xs text-gray-300">Inga kort</p>
              )}
            </div>
          </div>
        ))}

        {/* Add column */}
        <div className="flex w-72 shrink-0 items-start">
          {showAddColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3"
            >
              <input
                ref={newColumnTitleRef}
                type="text"
                required
                placeholder="Kolumnnamn..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Lägg till
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddColumn(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm font-medium text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ny kolumn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
