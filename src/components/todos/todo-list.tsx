'use client';

import { useState, useTransition } from 'react';
import { createTodo, updateTodo, deleteTodo, toggleTodoComplete } from '@/app/actions/todos';
import { SymbolPicker } from '@/components/schedule/symbol-picker';

interface TodoSymbol {
  id: string;
  name: string;
  imageUrl: string;
}

export interface TodoData {
  id: string;
  title: string;
  completed: boolean;
  sortOrder: number;
  pointValue: number;
  symbol: TodoSymbol | null;
}

interface TodoListProps {
  todos: TodoData[];
  isAdmin: boolean;
}

export function TodoList({ todos, isAdmin }: TodoListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoData | null>(null);

  function handleToggle(id: string) {
    startTransition(() => {
      toggleTodoComplete(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Ta bort denna uppgift?')) return;
    startTransition(() => {
      deleteTodo(id);
    });
  }

  function handleAdd(formData: FormData) {
    startTransition(() => {
      createTodo(formData);
      setShowAddForm(false);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingTodo) return;
    startTransition(() => {
      updateTodo(editingTodo.id, formData);
      setEditingTodo(null);
    });
  }

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Add button */}
      {isAdmin && !showAddForm && !editingTodo && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-indigo-400 hover:text-indigo-600"
        >
          <span className="text-lg">+</span> Lägg till uppgift
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <TodoForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isPending={isPending}
        />
      )}

      {/* Edit form */}
      {editingTodo && (
        <TodoForm
          todo={editingTodo}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTodo(null)}
          isPending={isPending}
        />
      )}

      {/* Pending todos */}
      {pending.length === 0 && completed.length === 0 && !showAddForm && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-3xl">✓</p>
          <p className="mt-2 text-sm">Inga uppgifter ännu</p>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-sm text-indigo-500 hover:underline"
            >
              Lägg till din första uppgift
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        {pending.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onEdit={isAdmin ? () => setEditingTodo(todo) : undefined}
            onDelete={isAdmin ? () => handleDelete(todo.id) : undefined}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Klara ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={isAdmin ? () => setEditingTodo(todo) : undefined}
                onDelete={isAdmin ? () => handleDelete(todo.id) : undefined}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TodoItem ──────────────────────────────────────────────────────

function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isPending,
}: {
  todo: TodoData;
  onToggle: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition ${
        todo.completed ? 'border-gray-100 opacity-60' : 'border-gray-200'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        disabled={isPending}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          todo.completed
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {todo.completed && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Symbol */}
      {todo.symbol && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={todo.symbol.imageUrl}
          alt={todo.symbol.name}
          className="h-8 w-8 shrink-0 object-contain"
        />
      )}

      {/* Title */}
      <span
        className={`flex-1 text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
      >
        {todo.title}
      </span>

      {/* Points badge */}
      {todo.pointValue > 0 && (
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          +{todo.pointValue}p
        </span>
      )}

      {/* Actions */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Redigera"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          title="Ta bort"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── TodoForm ──────────────────────────────────────────────────────

function TodoForm({
  todo,
  onSubmit,
  onCancel,
  isPending,
}: {
  todo?: TodoData;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<{ file: string; name: string } | null>(
    todo?.symbol
      ? {
          file: todo.symbol.imageUrl.replace('/symbols/mulberry/', ''),
          name: todo.symbol.name,
        }
      : null,
  );
  const [titleValue, setTitleValue] = useState(todo?.title || '');

  return (
    <>
      <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-3 text-sm font-semibold">
          {todo ? 'Redigera uppgift' : 'Ny uppgift'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          {selectedSymbol && (
            <>
              <input type="hidden" name="symbolFile" value={selectedSymbol.file} />
              <input type="hidden" name="symbolName" value={selectedSymbol.name} />
            </>
          )}
          {!selectedSymbol && todo?.symbol && (
            <input type="hidden" name="removeSymbol" value="true" />
          )}

          <div className="flex gap-2">
            {/* Symbol preview / picker trigger */}
            <button
              type="button"
              onClick={() => setShowSymbolPicker(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white transition hover:border-indigo-400"
              title="Välj symbol"
            >
              {selectedSymbol ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/symbols/mulberry/${selectedSymbol.file}`}
                  alt={selectedSymbol.name}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <span className="text-gray-300">🖼</span>
              )}
            </button>

            {/* Title input */}
            <input
              name="title"
              type="text"
              required
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Vad ska göras?"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600">Poäng:</label>
            <input
              name="pointValue"
              type="number"
              min="0"
              defaultValue={todo?.pointValue || 0}
              className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
            />

            {selectedSymbol && (
              <button
                type="button"
                onClick={() => setSelectedSymbol(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Ta bort symbol
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {todo ? 'Spara' : 'Lägg till'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showSymbolPicker && (
        <SymbolPicker
          onSelect={(file, name) => {
            setSelectedSymbol({ file, name });
            setShowSymbolPicker(false);
          }}
          onClose={() => setShowSymbolPicker(false)}
          activityTitle={titleValue}
        />
      )}
    </>
  );
}
