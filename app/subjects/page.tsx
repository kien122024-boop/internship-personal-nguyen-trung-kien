
"use client";

import { useCallback, useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
  teacher: string | null;
  description: string | null;
  _count?: {
    tasks: number;
    schedules: number;
  };
};

const emptyForm = {
  name: "",
  teacher: "",
  description: "",
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subjects", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Không thể tải môn học");

      const data = await res.json();
      setSubjects(data);
      setError("");
    } catch {
      setError("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(subject: Subject) {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      teacher: subject.teacher ?? "",
      description: subject.description ?? "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên môn học");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/subjects/${editingId}`
        : "/api/subjects";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Thao tác thất bại");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setNotice("Đã lưu môn học thành công!");
      await loadSubjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(subject: Subject) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa môn học "${subject.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      const res = await fetch(
        `/api/subjects/${subject.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa");
      }

      setNotice("Đã xóa môn học thành công!");
      await loadSubjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    }
  }

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.teacher ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Quản lý môn học
          </h1>
          <p className="mt-2 text-gray-400">
            Quản lý các môn học trong kế hoạch học tập
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Thêm môn học
        </button>
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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Tìm kiếm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <span className="text-gray-400">
          Tổng số: {subjects.length} môn học
        </span>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-gray-700 bg-gray-900 p-6"
        >
          <h2 className="mb-5 text-xl font-semibold text-white">
            {editingId ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-gray-300">
                Tên môn học *
              </label>
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"
                placeholder="Ví dụ: Lập trình Web"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Giảng viên
              </label>
              <input
                value={form.teacher}
                onChange={(e) =>
                  setForm({ ...form, teacher: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"
                placeholder="Tên giảng viên"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-gray-300">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"
              placeholder="Nhập mô tả môn học..."
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu môn học"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-gray-700 px-5 py-2 text-white hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-400">
          Đang tải dữ liệu...
        </p>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-lg text-gray-300">
            {search
              ? "Không tìm thấy môn học phù hợp"
              : "Chưa có môn học nào"}
          </p>
          <p className="mt-2 text-gray-500">
            Hãy thêm môn học để bắt đầu quản lý.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-500"
            >
              <h3 className="mb-3 text-xl font-semibold text-white">
                {subject.name}
              </h3>

              <p className="mb-2 text-gray-400">
                Giảng viên: {subject.teacher || "Chưa cập nhật"}
              </p>

              <p className="mb-4 min-h-12 text-sm text-gray-500">
                {subject.description || "Chưa có mô tả"}
              </p>

              <div className="mb-5 flex gap-4 text-sm text-gray-400">
                <span>
                  Nhiệm vụ: {subject._count?.tasks ?? 0}
                </span>
                <span>
                  Lịch học: {subject._count?.schedules ?? 0}
                </span>
              </div>

              <div className="flex gap-3 border-t border-gray-800 pt-4">
                <button
                  onClick={() => openEdit(subject)}
                  className="flex-1 rounded-lg bg-blue-600/20 px-4 py-2 text-blue-400 hover:bg-blue-600/30"
                >
                  Sửa
                </button>

                <button
                  onClick={() => handleDelete(subject)}
                  className="flex-1 rounded-lg bg-red-600/20 px-4 py-2 text-red-400 hover:bg-red-600/30"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
