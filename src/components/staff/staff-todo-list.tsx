"use client";

import { useEffect, useRef, useState } from "react";
import type { StaffTodoItem } from "@/types/staff";

type StaffTodoListProps = {
  initialTodos: StaffTodoItem[];
};

export default function StaffTodoList({ initialTodos }: StaffTodoListProps) {
  const [todos, setTodos] = useState<StaffTodoItem[]>(initialTodos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleComplete = (id: string, completed: boolean) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setOpenMenuId(null);
  };

  const handleEditStart = (todo: StaffTodoItem) => {
    setEditingId(todo.id);
    setEditValue(todo.label);
    setOpenMenuId(null);
  };

  const handleEditSave = (id: string) => {
    if (editValue.trim()) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, label: editValue.trim() } : todo,
        ),
      );
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const newId = `todo-${Date.now()}`;
    const newTodo: StaffTodoItem = {
      id: newId,
      label: "New Task",
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setEditingId(newId);
    setEditValue(newTodo.label);
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <section
      className="rounded-[28px] bg-white px-4 py-5 shadow-sm md:rounded-[44px] md:px-7 md:py-7 xl:rounded-[56px] xl:px-8 xl:py-8"
      aria-label="To do list"
    >
      <h2 className="mb-5 text-center text-[24px] font-semibold text-[#1a3b5c] md:mb-6 md:text-[32px] xl:text-[36px]">
        To do list
      </h2>

      <div className="flex flex-col gap-3 md:gap-4">
        {sortedTodos.map((item) => (
          <article
            key={item.id}
            className={`relative flex min-h-[72px] items-center gap-3 rounded-[24px] px-4 py-3 md:min-h-[96px] md:gap-4 md:rounded-[32px] md:px-6 md:py-4 xl:min-h-[106px] transition-colors ${
              item.completed ? "bg-[#1a3b5c]/60" : "bg-[#1a3b5c]"
            }`}
          >
            {/* Three-dot menu */}
            <div
              className="relative"
              ref={openMenuId === item.id ? menuRef : null}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenMenuId(openMenuId === item.id ? null : item.id)
                }
                className="flex cursor-pointer shrink-0 flex-col gap-[5px] p-2 hover:opacity-80 disabled:opacity-50"
                aria-label="Menu"
                aria-expanded={openMenuId === item.id}
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-white/70" />
                <span className="block h-1.5 w-1.5 rounded-full bg-white/70" />
                <span className="block h-1.5 w-1.5 rounded-full bg-white/70" />
              </button>

              {openMenuId === item.id && (
                <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-xl bg-white shadow-lg py-2">
                  <button
                    onClick={() => handleEditStart(item)}
                    className="w-full px-4 py-2 text-left text-sm text-[#1a3b5c] hover:bg-gray-100 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Task label */}
            <div className="flex-1 overflow-hidden" dir="rtl">
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleEditSave(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave(item.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="w-full bg-transparent text-right text-[18px] leading-snug text-white outline-none md:text-[24px] xl:text-[28px] border-b border-white/30 px-1"
                />
              ) : (
                <p
                  className={`text-right text-[18px] leading-snug text-white md:text-[24px] xl:text-[28px] break-words ${
                    item.completed ? "line-through opacity-70" : ""
                  }`}
                  onDoubleClick={() => handleEditStart(item)}
                >
                  {item.label}
                </p>
              )}
            </div>

            {/* Checkbox */}
            <label className="relative flex cursor-pointer items-center justify-center">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) =>
                  handleToggleComplete(item.id, e.target.checked)
                }
                className="peer sr-only"
              />
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 md:h-10 md:w-10 xl:h-11 xl:w-11 transition-colors ${
                  item.completed
                    ? "border-[#f4b24d] bg-[#f4b24d]"
                    : "border-white/40 bg-white/10 peer-hover:border-white/60"
                }`}
              >
                {item.completed && (
                  <svg
                    className="h-5 w-5 text-white md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </label>
          </article>
        ))}
        {todos.length === 0 && (
          <p className="text-center text-[#1a3b5c]/60 py-4 text-lg">
            No items in your to do list. Add one!
          </p>
        )}
      </div>

      {/* Add button */}
      <div className="mt-5 flex justify-end md:mt-6">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-full bg-[#f4b24d] px-7 py-2.5 text-[18px] font-bold text-[#1a3b5c] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-opacity duration-200 hover:opacity-90 md:px-9 md:py-3 md:text-[22px] xl:text-[24px]"
        >
          Add
        </button>
      </div>
    </section>
  );
}
