
"use client";

import { useCallback, useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  subjectId: number;
  subject: Subject;
};

type TaskForm = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  subjectId: string;
};

const emptyForm: TaskForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
  subjectId: "",
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

const statusLabels: Record<string, string> = {
  TODO: "Chưa làm",
  IN_PROGRESS: "Đang thực hiện",
  DONE: "Hoàn thành",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, subjectsRes] = await Promise.all([
        fetch("/api/tasks", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
      ]);

      if (!tasksRes.ok || !subjectsRes.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const tasksData = await tasksRes.json();
      const subjectsData = await subjectsRes.json();

      setTasks(tasksData);
      setSubjects(subjectsData);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openAdd() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      subjectId: subjects[0]?.id.toString() ?? "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.dueDate
        ? task.dueDate.slice(0, 10)
        : "",
      priority: task.priority,
      status: task.status,
      subjectId: task.subjectId.toString(),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim() || !form.subjectId) {
      setError("Vui lòng nhập tên nhiệm vụ và chọn môn học");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/tasks/${editingId}`
        : "/api/tasks";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          subjectId: Number(form.subjectId),
          dueDate: form.dueDate
            ? `${form.dueDate}T12:00:00.000Z`
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu nhiệm vụ");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setNotice("Lưu nhiệm vụ thành công!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Bạn muốn xóa "${task.title}"?`)) {
      return;
    }

    try {
      setError("");
      setNotice("");

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa nhiệm vụ");
      }

      setNotice("Xóa nhiệm vụ thành công!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    }
  }

  async function changeStatus(task: Task, status: string) {
    try {
      setError("");

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          subjectId: task.subjectId,
          priority: task.priority,
          status,
          dueDate: task.dueDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể cập nhật trạng thái");
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      `${task.title} ${task.subject.name}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filter === "ALL" || task.status === filter;

    return matchesSearch && matchesStatus;
  });

  const completed = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const pending = tasks.filter(
    (task) => task.status !== "DONE"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Quản lý nhiệm vụ
          </h1>
          <p className="mt-2 text-gray-400">
            Theo dõi bài tập và tiến độ học tập
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={subjects.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Thêm nhiệm vụ
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng nhiệm vụ", value: tasks.length },
          { label: "Chưa hoàn thành", value: pending },
          { label: "Đã hoàn thành", value: completed },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <p className="text-gray-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-lg bg-red-900/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="mb-5 rounded-lg bg-green-900/40 p-4 text-green-300">
          {notice}
        </div>
      )}

      {subjects.length === 0 && !loading && (
        <div className="mb-6 rounded-lg bg-yellow-900/30 p-4 text-yellow-300">
          Bạn cần thêm môn học trước khi tạo nhiệm vụ.
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="search"
          placeholder="Tìm kiếm nhiệm vụ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 p-3"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="TODO">Chưa làm</option>
          <option value="IN_PROGRESS">Đang thực hiện</option>
          <option value="DONE">Hoàn thành</option>
        </select>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-gray-700 bg-gray-900 p-6"
        >
          <h2 className="mb-5 text-xl font-semibold">
            {editingId ? "Chỉnh sửa nhiệm vụ" : "Thêm nhiệm vụ mới"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-gray-300">
                Tên nhiệm vụ *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
                placeholder="Ví dụ: Hoàn thành bài tập Next.js"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Môn học *
              </label>
              <select
                required
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <option value="">Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Hạn hoàn thành
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Mức độ ưu tiên
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <option value="TODO">Chưa làm</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-gray-300">
              Mô tả nhiệm vụ
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu nhiệm vụ"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-gray-700 px-5 py-2 hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-400">
          Đang tải nhiệm vụ...
        </p>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-400">
          {search || filter !== "ALL"
            ? "Không tìm thấy nhiệm vụ phù hợp"
            : "Chưa có nhiệm vụ nào. Hãy thêm nhiệm vụ mới!"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {task.title}
                  </h3>

                  <p className="mt-2 text-sm text-blue-400">
                    {task.subject.name}
                  </p>

                  <p className="mt-2 text-gray-400">
                    {task.description || "Chưa có mô tả"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-lg bg-gray-800 px-3 py-2">
                      Hạn:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("vi-VN", {
                            timeZone: "UTC",
                          })
                        : "Chưa đặt"}
                    </span>

                    <span className="rounded-lg bg-blue-900/40 px-3 py-2 text-blue-300">
                      Ưu tiên: {priorityLabels[task.priority]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    aria-label={`Trạng thái ${task.title}`}
                    value={task.status}
                    onChange={(e) =>
                      void changeStatus(task, e.target.value)
                    }
                    className="rounded-lg border border-gray-700 bg-gray-800 p-2"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => openEdit(task)}
                    className="rounded-lg bg-blue-600/20 px-4 py-2 text-blue-400 hover:bg-blue-600/30"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => void handleDelete(task)}
                    className="rounded-lg bg-red-600/20 px-4 py-2 text-red-400 hover:bg-red-600/30"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
