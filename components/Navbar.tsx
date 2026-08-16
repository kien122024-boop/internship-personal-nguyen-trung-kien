import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4 px-6 py-3">
        <Link
          href="/"
          className="font-medium text-gray-700 hover:text-blue-600"
        >
          Dashboard
        </Link>

        <Link
          href="/subjects"
          className="font-medium text-gray-700 hover:text-blue-600"
        >
          Môn học
        </Link>

        <Link
          href="/tasks"
          className="font-medium text-gray-700 hover:text-blue-600"
        >
          Nhiệm vụ
        </Link>

        <Link
          href="/schedules"
          className="font-medium text-gray-700 hover:text-blue-600"
        >
          Lịch học
        </Link>
      </div>
    </nav>
  );
}