
"use client";

import { useCallback, useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
};

type Schedule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subjectId: number;
  subject: Subject;
};

type ScheduleForm = {
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
};

const days = [
  { id: 1, name: "Thứ Hai", short: "T2" },
  { id: 2, name: "Thứ Ba", short: "T3" },
  { id: 3, name: "Thứ Tư", short: "T4" },
  { id: 4, name: "Thứ Năm", short: "T5" },
  { id: 5, name: "Thứ Sáu", short: "T6" },
  { id: 6, name: "Thứ Bảy", short: "T7" },
  { id: 7, name: "Chủ Nhật", short: "CN" },
];

const emptyForm: ScheduleForm = {
  subjectId: "",
  dayOfWeek: "1",
  startTime: "07:00",
  endTime: "09:00",
  room: "",
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [scheduleRes, subjectRes] = await Promise.all([
        fetch("/api/schedules", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
      ]);

      if (!scheduleRes.ok || !subjectRes.ok) {
        throw new Error("Không thể tải dữ liệu lịch học");
      }

      const scheduleData = await scheduleRes.json();
      const subjectData = await subjectRes.json();

      setSchedules(scheduleData);
      setSubjects(subjectData);
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

  function openAdd(day?: number) {
    setEditingId(null);
    setForm({
      ...emptyForm,
      dayOfWeek: String(day ?? 1),
      subjectId: subjects[0]?.id.toString() ?? "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(schedule: Schedule) {
    setEditingId(schedule.id);
    setForm({
      subjectId: String(schedule.subjectId),
      dayOfWeek: String(schedule.dayOfWeek),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room ?? "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.subjectId) {
      setError("Vui lòng chọn môn học");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/schedules/${editingId}`
        : "/api/schedules";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: Number(form.subjectId),
          dayOfWeek: Number(form.dayOfWeek),
          startTime: form.startTime,
          endTime: form.endTime,
          room: form.room,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu lịch học");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setNotice("Đã lưu lịch học thành công!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schedule: Schedule) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch học "${schedule.subject.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      const res = await fetch(
        `/api/schedules/${schedule.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa lịch học");
      }

      setNotice("Đã xóa lịch học thành công!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    }
  }

  const visibleDays = selectedDay
    ? days.filter((day) => day.id === selectedDay)
    : days;

  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      a.dayOfWeek - b.dayOfWeek ||
      a.startTime.localeCompare(b.startTime)
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Quản lý lịch học
          </h1>
          <p className="mt-2 text-gray-400">
            Sắp xếp thời khóa biểu học tập hàng tuần
          </p>
        </div>

        <button
          onClick={() => openAdd()}
          disabled={subjects.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm lịch học
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-gray-400">Tổng buổi học / tuần</p>
          <p className="mt-2 text-3xl font-bold">
            {schedules.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-gray-400">Số môn có lịch học</p>
          <p className="mt-2 text-3xl font-bold">
            {new Set(schedules.map((s) => s.subjectId)).size}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-gray-400">Số ngày có lịch học</p>
          <p className="mt-2 text-3xl font-bold">
            {new Set(schedules.map((s) => s.dayOfWeek)).size}
          </p>
        </div>
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
          Bạn cần thêm môn học trước khi tạo lịch học.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-gray-700 bg-gray-900 p-6"
        >
          <h2 className="mb-5 text-xl font-semibold">
            {editingId ? "Chỉnh sửa lịch học" : "Thêm lịch học mới"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
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
                Ngày học *
              </label>
              <select
                value={form.dayOfWeek}
                onChange={(e) =>
                  setForm({ ...form, dayOfWeek: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Giờ bắt đầu *
              </label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-300">
                Giờ kết thúc *
              </label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-gray-300">
                Phòng học
              </label>
              <input
                value={form.room}
                onChange={(e) =>
                  setForm({ ...form, room: e.target.value })
                }
                placeholder="Ví dụ: A101 hoặc Online"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu lịch học"}
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

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDay(null)}
          className={`rounded-lg px-4 py-2 ${
            selectedDay === null
              ? "bg-blue-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Cả tuần
        </button>

        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`rounded-lg px-4 py-2 ${
              selectedDay === day.id
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {day.short}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">
          Đang tải lịch học...
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleDays.map((day) => {
            const daySchedules = sortedSchedules.filter(
              (schedule) => schedule.dayOfWeek === day.id
            );

            return (
              <section
                key={day.id}
                className="min-h-64 rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="mb-5 flex items-center justify-between border-b border-gray-700 pb-4">
                  <h2 className="text-lg font-bold">
                    {day.name}
                  </h2>

                  <button
                    onClick={() => openAdd(day.id)}
                    disabled={subjects.length === 0}
                    className="rounded-lg bg-blue-600/20 px-3 py-1 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50"
                  >
                    + Thêm
                  </button>
                </div>

                {daySchedules.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Chưa có lịch học
                  </p>
                ) : (
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="rounded-lg border border-blue-900/50 bg-blue-950/40 p-4"
                      >
                        <p className="font-semibold text-blue-300">
                          {schedule.subject.name}
                        </p>

                        <p className="mt-2 text-sm text-gray-300">
                          {schedule.startTime} - {schedule.endTime}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Phòng: {schedule.room || "Chưa cập nhật"}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => openEdit(schedule)}
                            className="flex-1 rounded-lg bg-blue-600/20 px-3 py-2 text-sm text-blue-300 hover:bg-blue-600/30"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() => void handleDelete(schedule)}
                            className="flex-1 rounded-lg bg-red-600/20 px-3 py-2 text-sm text-red-300 hover:bg-red-600/30"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
