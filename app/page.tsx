export default function Home() {
  return (
    <div>
      <section className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Tổng quan việc học của bạn
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Môn học
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            5
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Nhiệm vụ
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            12
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Đã hoàn thành
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            7
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Nhiệm vụ sắp tới
        </h3>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800">
              Hoàn thành bài Minesweeper
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Trí tuệ nhân tạo
            </p>

            <p className="mt-2 text-sm">
              Deadline: 20/08/2026
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800">
              Học Next.js
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Lập trình Web
            </p>

            <p className="mt-2 text-sm">
              Deadline: 22/08/2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}