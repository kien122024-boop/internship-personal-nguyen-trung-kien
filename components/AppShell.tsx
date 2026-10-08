
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = useSession();

  // Các trang không yêu cầu đăng nhập
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const isLoggedIn = Boolean(session?.user);

  useEffect(() => {
    if (isPending) return;

    // Chưa đăng nhập: chuyển về Login
    if (!isLoggedIn && !isAuthPage) {
      router.replace("/login");
      return;
    }

    // Đã đăng nhập: không cần vào Login/Register
    if (isLoggedIn && isAuthPage) {
      router.replace("/");
    }
  }, [isPending, isLoggedIn, isAuthPage, router]);

  // Hiển thị trang đăng nhập hoặc đăng ký
  if (isAuthPage && !isLoggedIn) {
    return <>{children}</>;
  }

  // Chờ kiểm tra phiên đăng nhập hoặc chuyển trang
  if (
    isPending ||
    !isLoggedIn ||
    (isAuthPage && isLoggedIn)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080e1c]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <h2 className="text-xl font-semibold text-white">
            Study Planner
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  // Giao diện chính dành cho người đã đăng nhập
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
