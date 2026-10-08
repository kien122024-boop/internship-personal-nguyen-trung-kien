
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useSession,
  updateUser,
  changePassword,
} from "@/lib/auth-client";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();

  const user = session?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (!selectedAvatar) {
      setAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedAvatar);
    setAvatarPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedAvatar]);

  const initials = (user?.name || "Người dùng")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  const currentAvatar = avatarPreview || savedAvatar || user?.image;

  function clearMessages() {
    setMessage("");
    setError("");
  }

  // Chọn ảnh đại diện từ máy tính
  function handleSelectAvatar(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    clearMessages();

    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > MAX_AVATAR_SIZE) {
      setError("Ảnh đại diện phải có dung lượng tối đa 2 MB");
      event.target.value = "";
      return;
    }

    setSelectedAvatar(file);
    event.target.value = "";
  }

  // Hủy ảnh đã chọn
  function handleCancelAvatar() {
    setSelectedAvatar(null);
    clearMessages();
  }

  // Tải ảnh lên Cloudinary thông qua API
  async function handleUploadAvatar() {
    if (!selectedAvatar || uploadingAvatar) return;

    clearMessages();
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedAvatar);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Không thể cập nhật ảnh đại diện"
        );
      }

      setSavedAvatar(data.image);
      setSelectedAvatar(null);

      // Làm mới session để Header nhận avatar mới
      await refetch();

      setMessage("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi khi tải ảnh đại diện"
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Cập nhật tên hiển thị
  async function handleUpdateProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Vui lòng nhập tên hiển thị");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await updateUser({
        name: trimmedName,
      });

      if (updateError) {
        throw new Error(
          updateError.message || "Không thể cập nhật thông tin"
        );
      }

      await refetch();
      setMessage("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi khi cập nhật thông tin"
      );
    } finally {
      setSaving(false);
    }
  }

  // Đổi mật khẩu
  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setChangingPassword(true);

    try {
      const { error: passwordError } = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (passwordError) {
        throw new Error(
          passwordError.message || "Không thể đổi mật khẩu"
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Đổi mật khẩu thành công!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi khi đổi mật khẩu"
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (isPending) {
    return (
      <div className="py-20 text-center text-gray-400">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-white">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
      >
        ← Quay lại trang chủ
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Thông tin cá nhân
        </h1>

        <p className="mt-2 text-gray-400">
          Quản lý thông tin và bảo mật tài khoản Study Planner
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-700 bg-green-950/40 p-4 text-green-300"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-300"
        >
          {error}
        </div>
      )}

      {/* Ảnh đại diện */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111a2d] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-blue-500 bg-blue-800 text-3xl font-bold shadow-lg">
            {currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAvatar}
                alt="Ảnh đại diện"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold">
            {user.name}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {user.email}
          </p>

          <p className="mt-3 text-xs text-gray-500">
            Thành viên từ: {createdAt}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSelectAvatar}
            className="hidden"
            aria-label="Chọn ảnh đại diện"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            📷 Thay đổi ảnh đại diện
          </button>

          <p className="mt-3 text-xs text-gray-400">
            Hỗ trợ JPG, PNG, WebP. Tối đa 2 MB.
          </p>

          {selectedAvatar && (
            <div className="mt-5 w-full max-w-sm rounded-xl border border-blue-800 bg-blue-950/30 p-4">
              <p className="mb-3 break-all text-sm text-blue-200">
                Ảnh đã chọn: {selectedAvatar.name}
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleUploadAvatar()}
                  disabled={uploadingAvatar}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {uploadingAvatar
                    ? "Đang tải ảnh..."
                    : "Lưu ảnh đại diện"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelAvatar}
                  disabled={uploadingAvatar}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Thông tin tài khoản */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111a2d] p-6">
        <h2 className="mb-6 text-xl font-bold">
          Thông tin tài khoản
        </h2>

        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Tên hiển thị
              </label>

              <input
                id="profile-name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                className="w-full rounded-xl border border-gray-700 bg-[#1c2940] px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Địa chỉ email
              </label>

              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-700 bg-[#1c2940]/60 px-4 py-3 text-gray-400"
              />

              <p className="mt-2 text-xs text-gray-500">
                Email đăng nhập hiện không thể thay đổi tại đây.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>

      {/* Đổi mật khẩu */}
      <section className="rounded-2xl border border-white/10 bg-[#111a2d] p-6">
        <h2 className="mb-2 text-xl font-bold">
          Đổi mật khẩu
        </h2>

        <p className="mb-6 text-sm text-gray-400">
          Sử dụng mật khẩu mới có ít nhất 8 ký tự
          để bảo vệ tài khoản.
        </p>

        <form onSubmit={handleChangePassword}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="current-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Mật khẩu hiện tại
              </label>

              <input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                className="w-full rounded-xl border border-gray-700 bg-[#1c2940] px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Mật khẩu mới
              </label>

              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="w-full rounded-xl border border-gray-700 bg-[#1c2940] px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Xác nhận mật khẩu mới
              </label>

              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full rounded-xl border border-gray-700 bg-[#1c2940] px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {changingPassword
                ? "Đang cập nhật..."
                : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
