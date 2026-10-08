
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Subject = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  subject: Subject;
};

type Schedule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: Subject;
};

const dayNames = [
  "",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [subjectRes, taskRes, scheduleRes] =
        await Promise.all([
          fetch("/api/subjects", { cache: "no-store" }),
          fetch("/api/tasks", { cache: "no-store" }),
          fetch("/api/schedules", { cache: "no-store" }),
        ]);

      if (
        !subjectRes.ok ||
        !taskRes.ok ||
        !scheduleRes.ok
      ) {
        throw new Error("Không thể tải dữ liệu trang chủ");
      }

      const [subjectData, taskData, scheduleData] =
        await Promise.all([
          subjectRes.json(),
          taskRes.json(),
          scheduleRes.json(),
        ]);

      setSubjects(subjectData);
      setTasks(taskData);
      setSchedules(scheduleData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const pendingTasks = tasks.length - completedTasks;

  const completionRate =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.status !== "DONE" &&
        task.dueDate !== null
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() -
        new Date(b.dueDate!).getTime()
    )
    .slice(0, 5);

  const today = new Date();

  const todayDayOfWeek =
    today.getDay() === 0 ? 7 : today.getDay();

  const todaySchedules = schedules
    .filter(
      (schedule) =>
        schedule.dayOfWeek === todayDayOfWeek
    )
    .sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

  const stats = [
    {
      label: "Môn học",
      value: subjects.length,
      href: "/subjects",
      icon: "📚",
      color: "from-blue-600 to-blue-800",
    },
    {
      label: "Tổng nhiệm vụ",
      value: tasks.length,
      href: "/tasks",
      icon: "📝",
      color: "from-violet-600 to-violet-800",
    },
    {
      label: "Đã hoàn thành",
      value: completedTasks,
      href: "/tasks",
      icon: "✅",
      color: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Chưa hoàn thành",
      value: pendingTasks,
      href: "/tasks",
      icon: "⏳",
      color: "from-orange-600 to-orange-800",
    },
    {
      label: "Buổi học / tuần",
      value: schedules.length,
      href: "/schedules",
      icon: "📅",
      color: "from-cyan-600 to-cyan-800",
    },
  ];

  return (
    <main className="min-h-screen bg-[#090e1a] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              STUDY PLANNER
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trang chủ
            </h1>

            <p className="mt-3 text-gray-400">
              Theo dõi môn học, nhiệm vụ và lịch học của bạn
            </p>
          </div>

          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            ↻ Làm mới dữ liệu
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-700 bg-red-950/50 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Đang tải dữ liệu trang chủ...
          </div>
        ) : (
          <>
            {/* STATISTICS */}
            <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => (
                <Link
                  href={stat.href}
                  key={stat.label}
                  className="group rounded-2xl border border-white/10 bg-[#111a2d] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-2xl`}
                    >
                      {stat.icon}
                    </div>

                    <span className="text-gray-500 transition group-hover:text-blue-400">
                      ↗
                    </span>
                  </div>

                  <p className="text-sm text-gray-400">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stat.value}
                  </p>
                </Link>
              ))}
            </div>

            {/* PROGRESS */}
            <section className="mb-8 rounded-2xl border border-white/10 bg-[#111a2d] p-6 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Tiến độ học tập
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Theo dõi mức độ hoàn thành nhiệm vụ
                  </p>
                </div>

                <span className="text-2xl font-bold text-blue-400">
                  {completionRate}%
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm text-gray-400">
                Đã hoàn thành {completedTasks}/{tasks.length} nhiệm vụ
              </p>
            </section>

            {/* TASKS AND SCHEDULE */}
            <div className="grid gap-8 lg:grid-cols-2">

              {/* UPCOMING TASKS */}
              <section className="rounded-2xl border border-white/10 bg-[#111a2d] p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    📋 Nhiệm vụ sắp tới
                  </h2>

                  <Link
                    href="/tasks"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="rounded-xl bg-[#1c2940] py-12 text-center text-gray-400">
                    Không có nhiệm vụ sắp tới
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-white/5 bg-[#1c2940] p-5 transition hover:border-blue-500/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold">
                            {task.title}
                          </h3>

                          <span
                            className={`rounded-lg px-2 py-1 text-xs ${
                              task.priority === "HIGH"
                                ? "bg-red-500/20 text-red-400"
                                : task.priority === "MEDIUM"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {task.priority === "HIGH"
                              ? "Cao"
                              : task.priority === "MEDIUM"
                              ? "Trung bình"
                              : "Thấp"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-blue-400">
                          {task.subject.name}
                        </p>

                        <p className="mt-3 text-sm text-gray-400">
                          📅 Hạn:{" "}
                          {task.dueDate
                            ? new Date(
                                task.dueDate
                              ).toLocaleDateString(
                                "vi-VN",
                                { timeZone: "UTC" }
                              )
                            : "Chưa đặt"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* TODAY SCHEDULE */}
              <section className="rounded-2xl border border-white/10 bg-[#111a2d] p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    📅 Lịch học hôm nay
                  </h2>

                  <Link
                    href="/schedules"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    Xem lịch học →
                  </Link>
                </div>

                <p className="mb-5 text-sm text-gray-400">
                  {dayNames[todayDayOfWeek]}
                </p>

                {todaySchedules.length === 0 ? (
                  <div className="rounded-xl bg-[#1c2940] py-12 text-center text-gray-400">
                    Hôm nay không có lịch học
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="rounded-xl border border-white/5 bg-[#1c2940] p-5 transition hover:border-blue-500/30"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-semibold">
                            {schedule.subject.name}
                          </h3>

                          <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                            Lịch học
                          </span>
                        </div>

                        <p className="text-sm text-gray-300">
                          🕒 {schedule.startTime} -{" "}
                          {schedule.endTime}
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                          📍 Phòng:{" "}
                          {schedule.room || "Chưa cập nhật"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* QUICK ACCESS */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#111a2d] p-6">
              <h2 className="mb-5 text-xl font-bold">
                Truy cập nhanh
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <Link
                  href="/subjects"
                  className="rounded-xl bg-blue-600/15 p-5 text-center font-medium text-blue-300 transition hover:bg-blue-600/25"
                >
                  📚 Quản lý môn học
                </Link>

                <Link
                  href="/tasks"
                  className="rounded-xl bg-violet-600/15 p-5 text-center font-medium text-violet-300 transition hover:bg-violet-600/25"
                >
                  📝 Quản lý nhiệm vụ
                </Link>

                <Link
                  href="/schedules"
                  className="rounded-xl bg-cyan-600/15 p-5 text-center font-medium text-cyan-300 transition hover:bg-cyan-600/25"
                >
                  📅 Xem lịch học
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
