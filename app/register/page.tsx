
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message || "Đăng ký không thành công."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể đăng ký. Vui lòng thử lại.");
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
              Bắt đầu hành trình
              <br />
              học tập của bạn.
            </h1>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              Tạo tài khoản để quản lý môn học,
              nhiệm vụ và lịch học một cách hiệu quả.
            </p>

            <div className="mt-12 space-y-5">
              <p>✓ Quản lý môn học dễ dàng</p>
              <p>✓ Theo dõi tiến độ học tập</p>
              <p>✓ Sắp xếp lịch học thông minh</p>
              <p>✓ Truy cập dữ liệu thuận tiện</p>
            </div>
          </div>

          <p className="mt-12 text-sm text-blue-200">
            © 2026 Study Planner
          </p>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-12">
          <div className="mb-7">
            <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              THAM GIA STUDY PLANNER
            </span>

            <h2 className="mt-6 text-3xl font-bold">
              Tạo tài khoản
            </h2>

            <p className="mt-3 text-slate-400">
              Điền thông tin để bắt đầu học tập cùng chúng tôi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3 pr-20 outline-none focus:border-blue-500"
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

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1324] px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>

          <Link href="/" className="mt-6 text-center text-sm text-slate-500 hover:text-white">
            ← Quay về trang chủ
          </Link>
        </section>
      </div>
    </main>
  );
}
