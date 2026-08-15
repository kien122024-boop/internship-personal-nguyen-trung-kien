const schedules = [
  {
    id: 1,
    subject: "Trí tuệ nhân tạo",
    day: "Thứ 2",
    time: "07:00 - 09:30",
    room: "A101",
  },
  {
    id: 2,
    subject: "Lập trình Web",
    day: "Thứ 4",
    time: "13:00 - 15:30",
    room: "B203",
  },
  {
    id: 3,
    subject: "Tiếng Anh",
    day: "Thứ 6",
    time: "09:30 - 11:00",
    room: "C105",
  },
];

export default function SchedulesPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Lịch học
        </h2>

        <p className="mt-2 text-gray-600">
          Lịch học trong tuần của bạn
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-4 text-left">Môn học</th>
              <th className="p-4 text-left">Ngày</th>
              <th className="p-4 text-left">Thời gian</th>
              <th className="p-4 text-left">Phòng</th>
            </tr>
          </thead>

          <tbody>
            {schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-b last:border-0"
              >
                <td className="p-4 font-medium">
                  {schedule.subject}
                </td>

                <td className="p-4">
                  {schedule.day}
                </td>

                <td className="p-4">
                  {schedule.time}
                </td>

                <td className="p-4">
                  {schedule.room}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}