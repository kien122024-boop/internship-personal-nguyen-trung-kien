const subjects = [
  {
    id: 1,
    name: "Trí tuệ nhân tạo",
    teacher: "Nguyễn Văn A",
    room: "A101",
  },
  {
    id: 2,
    name: "Lập trình Web",
    teacher: "Trần Văn B",
    room: "B203",
  },
  {
    id: 3,
    name: "Tiếng Anh",
    teacher: "Lê Thị C",
    room: "C105",
  },
];

export default function SubjectsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Môn học
        </h2>

        <p className="mt-2 text-gray-600">
          Danh sách các môn học của bạn
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {subject.name}
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Giảng viên: {subject.teacher}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Phòng: {subject.room}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}