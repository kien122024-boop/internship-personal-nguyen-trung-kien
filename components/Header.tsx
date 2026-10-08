
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;
  const name = user?.name || "Người dùng";

  // Lấy chữ viết tắt làm avatar mặc định
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  // Xử lý đăng xuất
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await signOut();

      if (error) {
        alert(error.message || "Đăng xuất thất bại");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Có lỗi xảy ra khi đăng xuất");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

        {/* Tên ứng dụng */}
        <div>
          <h1 className="text-2xl font-bold">
            Study Planner
          </h1>

          <p className="text-sm text-blue-100">
            Quản lý lịch học và nhiệm vụ
          </p>
        </div>

        {/* Thông tin người dùng */}
        {!isPending && user && (
          <div className="flex items-center gap-4">

            {/* Nhấp avatar hoặc tên để xem Profile */}
            <Link
              href="/profile"
              title="Xem thông tin cá nhân"
              className="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/10"
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-blue-800 text-sm font-bold shadow-md transition group-hover:border-white">

                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}

              </div>

              {/* Tên người dùng */}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">
                  {name}
                </p>

                <p className="text-xs text-blue-100 group-hover:text-white">
                  Thông tin cá nhân
                </p>
              </div>
            </Link>

            {/* Nút đăng xuất */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Đang thoát..." : "Đăng xuất"}
            </button>

          </div>
        )}
      </div>
    </header>
  );
}
