const tasks = [
  {
    id: 1,
    title: "Hoàn thành bài Minesweeper",
    subject: "Trí tuệ nhân tạo",
    deadline: "20/08/2026",
    status: "Đang làm",
    priority: "Cao",
  },
  {
    id: 2,
    title: "Học Next.js",
    subject: "Lập trình Web",
    deadline: "22/08/2026",
    status: "Chưa làm",
    priority: "Trung bình",
  },
  {
    id: 3,
    title: "Chuẩn bị bài thuyết trình",
    subject: "Tiếng Anh",
    deadline: "25/08/2026",
    status: "Hoàn thành",
    priority: "Thấp",
  },
];

export default function TasksPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Nhiệm vụ
        </h2>

        <p className="mt-2 text-gray-600">
          Danh sách các nhiệm vụ cần hoàn thành
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {task.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Môn học: {task.subject}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Deadline: {task.deadline}
                </p>
              </div>

              <div className="text-sm">
                <p>
                  Trạng thái:{" "}
                  <span className="font-semibold">
                    {task.status}
                  </span>
                </p>

                <p className="mt-2">
                  Ưu tiên:{" "}
                  <span className="font-semibold">
                    {task.priority}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}