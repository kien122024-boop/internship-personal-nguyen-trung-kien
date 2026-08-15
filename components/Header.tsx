export default function Header() {
  return (
    <header className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">
            Study Planner
          </h1>

          <p className="text-sm text-blue-100">
            Quản lý lịch học và nhiệm vụ
          </p>
        </div>

        <div className="text-sm">
          Xin chào 👋
        </div>
      </div>
    </header>
  );
}