"use client";

import { useEffect, useRef, useState, useId } from "react";
import type { StaffTodoItem } from "@/types/staff";
import {
  toggleTodo,
  deleteTodo,
  createTodo,
  updateTodo,
} from "@/lib/actions/staff-todo";
import toast from "react-hot-toast";

type StaffTodoListProps = {
  initialTodos: StaffTodoItem[];
  staffMembers?: { id: string; name: string }[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export default function StaffTodoList({
  initialTodos,
  staffMembers = [],
  currentUserId,
  isAdmin = false,
}: StaffTodoListProps) {
  const [todos, setTodos] = useState<StaffTodoItem[]>(initialTodos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(currentUserId || "");

  const menuRef = useRef<HTMLDivElement>(null);
  const taskTitleId = useId();
  const staffSelectId = useId();

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

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

  const handleToggleComplete = async (id: string, completed: boolean) => {
    // Optimistic update
    const oldTodos = [...todos];
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
    );

    const result = await toggleTodo(id, completed);
    if (!result.success) {
      setTodos(oldTodos);
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    const oldTodos = [...todos];
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setOpenMenuId(null);

    const result = await deleteTodo(id);
    if (!result.success) {
      setTodos(oldTodos);
      toast.error("Failed to delete task");
    } else {
      toast.success("Task deleted");
    }
  };

  const handleEditStart = (todo: StaffTodoItem) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
    setOpenMenuId(null);
  };

  const handleEditSave = async (id: string) => {
    if (editValue.trim()) {
      const oldTodos = [...todos];
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, title: editValue.trim() } : todo,
        ),
      );

      const result = await updateTodo(id, { title: editValue.trim() });
      if (!result.success) {
        setTodos(oldTodos);
        toast.error("Failed to update task");
      }
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim() || !selectedStaffId) {
      toast.error("Please provide a title and select a staff member");
      return;
    }

    const result = await createTodo({
      title: newTodoTitle.trim(),
      staffId: selectedStaffId,
    });

    if (result.success && result.todo) {
      const newTodo: StaffTodoItem = {
        id: result.todo.id,
        title: result.todo.title,
        completed: result.todo.completed,
        staffId: result.todo.staffId,
        staffName:
          staffMembers.find((s) => s.id === result.todo?.staffId)?.name ||
          "Unknown",
      };
      setTodos((prev) => [newTodo, ...prev]);
      setShowAddModal(false);
      setNewTodoTitle("");
      toast.success("Task added");
    } else {
      toast.error("Failed to add task");
    }
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
                    type="button"
                    onClick={() => handleEditStart(item)}
                    className="w-full px-4 py-2 text-left text-sm text-[#1a3b5c] hover:bg-gray-100 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Task label and Assigned Staff */}
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
                <div>
                  <p
                    className={`text-right text-[18px] leading-snug text-white md:text-[24px] xl:text-[28px] break-words ${
                      item.completed ? "line-through opacity-70" : ""
                    }`}
                    onDoubleClick={() => handleEditStart(item)}
                  >
                    {item.title}
                  </p>
                  {isAdmin && item.staffName && (
                    <span className="text-xs text-white/60 md:text-sm">
                      Assigned to: {item.staffName}
                    </span>
                  )}
                </div>
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
                    aria-label="Completed"
                    role="img"
                  >
                    <title>Completed</title>
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
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-[#f4b24d] px-7 py-2.5 text-[18px] font-bold text-[#1a3b5c] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-opacity duration-200 hover:opacity-90 md:px-9 md:py-3 md:text-[22px] xl:text-[24px]"
        >
          Add
        </button>
      </div>

      {/* Simple Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl md:p-8"
            dir="rtl"
          >
            <h3 className="mb-4 text-xl font-bold text-[#1a3b5c] md:text-2xl">
              Add New Task
            </h3>
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div>
                <label
                  htmlFor={taskTitleId}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Task Title
                </label>
                <input
                  id={taskTitleId}
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-[#f4b24d] focus:outline-none focus:ring-1 focus:ring-[#f4b24d]"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>

              {isAdmin && staffMembers.length > 0 && (
                <div>
                  <label
                    htmlFor={staffSelectId}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Assign to Staff
                  </label>
                  <select
                    id={staffSelectId}
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-[#f4b24d] focus:outline-none focus:ring-1 focus:ring-[#f4b24d]"
                  >
                    <option value="">Select staff member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1a3b5c] py-2 text-white transition hover:bg-[#1a3b5c]/90"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-2 text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
