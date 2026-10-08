
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

// =====================================
// KIỂM TRA ĐỊNH DẠNG GIỜ HH:mm
// =====================================
function validTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

// =====================================
// PUT - CẬP NHẬT LỊCH HỌC
// Chỉ được sửa lịch học của mình
// =====================================
export async function PUT(
  request: NextRequest,
  context: Context
) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để sửa lịch học" },
        { status: 401 }
      );
    }

    // 2. Lấy ID người đăng nhập
    const userId = Number(session.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Thông tin tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 3. Kiểm tra ID lịch học
    const { id } = await context.params;
    const scheduleId = Number(id);

    if (
      !Number.isSafeInteger(scheduleId) ||
      scheduleId <= 0
    ) {
      return NextResponse.json(
        { error: "ID lịch học không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Kiểm tra lịch học thuộc tài khoản
    const existingSchedule =
      await prisma.schedule.findFirst({
        where: {
          id: scheduleId,
          subject: {
            userId,
          },
        },
      });

    if (!existingSchedule) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy lịch học hoặc lịch học không thuộc tài khoản của bạn",
        },
        { status: 404 }
      );
    }

    // 5. Đọc dữ liệu
    const body = await request.json();

    const dayOfWeek = Number(body?.dayOfWeek);
    const subjectId = Number(body?.subjectId);
    const startTime = body?.startTime;
    const endTime = body?.endTime;

    // 6. Kiểm tra thứ trong tuần
    if (
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 1 ||
      dayOfWeek > 7
    ) {
      return NextResponse.json(
        { error: "Ngày học không hợp lệ" },
        { status: 400 }
      );
    }

    // 7. Kiểm tra định dạng giờ
    if (!validTime(startTime) || !validTime(endTime)) {
      return NextResponse.json(
        { error: "Giờ học phải có định dạng HH:mm" },
        { status: 400 }
      );
    }

    // 8. Kiểm tra giờ kết thúc
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Giờ kết thúc phải sau giờ bắt đầu" },
        { status: 400 }
      );
    }

    // 9. Kiểm tra ID môn học
    if (
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0
    ) {
      return NextResponse.json(
        { error: "Vui lòng chọn môn học hợp lệ" },
        { status: 400 }
      );
    }

    // 10. Môn học được chọn phải thuộc tài khoản
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId,
      },
    });

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Môn học không tồn tại hoặc không thuộc tài khoản của bạn",
        },
        { status: 404 }
      );
    }

    // 11. Kiểm tra trùng lịch
    // Bỏ qua lịch học đang sửa
    const conflict = await prisma.schedule.findFirst({
      where: {
        id: {
          not: scheduleId,
        },
        subject: {
          userId,
        },
        dayOfWeek,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (conflict) {
      return NextResponse.json(
        {
          error:
            "Lịch học bị trùng thời gian. Vui lòng chọn giờ khác.",
        },
        { status: 409 }
      );
    }

    // 12. Cập nhật lịch học của tài khoản
    const result = await prisma.schedule.updateMany({
      where: {
        id: scheduleId,
        subject: {
          userId,
        },
      },
      data: {
        dayOfWeek,
        startTime,
        endTime,

        room:
          typeof body.room === "string"
            ? body.room.trim()
            : null,

        subjectId: subject.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy lịch học hoặc bạn không có quyền sửa",
        },
        { status: 404 }
      );
    }

    // 13. Lấy lịch học sau khi cập nhật
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        subject: {
          userId,
        },
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("PUT schedule error:", error);

    return NextResponse.json(
      { error: "Không thể cập nhật lịch học" },
      { status: 500 }
    );
  }
}

// =====================================
// DELETE - XÓA LỊCH HỌC
// Chỉ được xóa lịch học của mình
// =====================================
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để xóa lịch học" },
        { status: 401 }
      );
    }

    // 2. Lấy ID người đăng nhập
    const userId = Number(session.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Thông tin tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 3. Kiểm tra ID lịch học
    const { id } = await context.params;
    const scheduleId = Number(id);

    if (
      !Number.isSafeInteger(scheduleId) ||
      scheduleId <= 0
    ) {
      return NextResponse.json(
        { error: "ID lịch học không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Chỉ xóa lịch học thuộc tài khoản
    const result = await prisma.schedule.deleteMany({
      where: {
        id: scheduleId,
        subject: {
          userId,
        },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy lịch học hoặc bạn không có quyền xóa",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Xóa lịch học thành công",
    });
  } catch (error) {
    console.error("DELETE schedule error:", error);

    return NextResponse.json(
      { error: "Không thể xóa lịch học" },
      { status: 500 }
    );
  }
}
