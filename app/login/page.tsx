
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Email hoặc mật khẩu không chính xác."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080e1c] px-4 py-12 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111b30] shadow-2xl lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-12 lg:flex">
          <div>
            <div className="mb-16 flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 text-2xl">
                📚
              </div>
              <span className="text-2xl font-bold">
                Study Planner
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight">
              Học tập thông minh.
              <br />
              Quản lý dễ dàng.
            </h1>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              Quản lý môn học, theo dõi nhiệm vụ và
              sắp xếp lịch học trên cùng một nền tảng.
            </p>

            <div className="mt-12 space-y-5">
              <p>✓ Quản lý môn học khoa học</p>
              <p>✓ Theo dõi tiến độ học tập</p>
              <p>✓ Sắp xếp lịch học thuận tiện</p>
              <p>✓ Hỗ trợ học sinh và giáo viên</p>
            </div>
          </div>

          <p className="mt-12 text-sm text-blue-200">
            © 2026 Study Planner
          </p>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-12">
          <div className="mb-9">
            <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              CHÀO MỪNG TRỞ LẠI
            </span>

            <h2 className="mt-6 text-3xl font-bold">
              Đăng nhập
            </h2>

            <p className="mt-3 text-slate-400">
              Đăng nhập để tiếp tục quản lý kế hoạch
              học tập của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Địa chỉ email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3.5 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Mật khẩu
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3.5 pr-20 outline-none transition focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-400"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>

          <Link
            href="/"
            className="mt-8 text-center text-sm text-slate-500 hover:text-white"
          >
            ← Quay về trang chủ
          </Link>
        </section>
      </div>
    </main>
  );
}
