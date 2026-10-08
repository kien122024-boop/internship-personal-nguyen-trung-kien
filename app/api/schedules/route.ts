
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
// GET - LẤY LỊCH HỌC CỦA NGƯỜI ĐĂNG NHẬP
// =====================================
export async function GET(request: NextRequest) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để xem lịch học" },
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

    // 3. Chỉ lấy lịch học thuộc môn học của tài khoản
    const schedules = await prisma.schedule.findMany({
      where: {
        subject: {
          userId,
        },
      },
      include: {
        subject: true,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET schedules error:", error);

    return NextResponse.json(
      { error: "Không thể tải danh sách lịch học" },
      { status: 500 }
    );
  }
}

// =====================================
// POST - THÊM LỊCH HỌC
// CHỈ CẦN ĐĂNG NHẬP
// =====================================
export async function POST(request: NextRequest) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thêm lịch học" },
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

    // 3. Đọc dữ liệu
    const body = await request.json();

    const dayOfWeek = Number(body?.dayOfWeek);
    const subjectId = Number(body?.subjectId);
    const startTime = body?.startTime;
    const endTime = body?.endTime;

    // 4. Kiểm tra thứ trong tuần (1 - 7)
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

    // 5. Kiểm tra định dạng giờ
    if (!validTime(startTime) || !validTime(endTime)) {
      return NextResponse.json(
        { error: "Giờ học phải có định dạng HH:mm" },
        { status: 400 }
      );
    }

    // 6. Kiểm tra giờ kết thúc
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Giờ kết thúc phải sau giờ bắt đầu" },
        { status: 400 }
      );
    }

    // 7. Kiểm tra ID môn học
    if (
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0
    ) {
      return NextResponse.json(
        { error: "Vui lòng chọn môn học hợp lệ" },
        { status: 400 }
      );
    }

    // 8. Kiểm tra môn học thuộc tài khoản
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

    // 9. Kiểm tra trùng lịch trong tài khoản
    // Hai lịch trùng khi:
    // Giờ bắt đầu mới < giờ kết thúc cũ
    // Và giờ kết thúc mới > giờ bắt đầu cũ
    const conflict = await prisma.schedule.findFirst({
      where: {
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
            "Thời gian này đã có lịch học khác. Vui lòng chọn giờ khác.",
        },
        { status: 409 }
      );
    }

    // 10. Tạo lịch học mới
    const schedule = await prisma.schedule.create({
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
      include: {
        subject: true,
      },
    });

    return NextResponse.json(schedule, {
      status: 201,
    });
  } catch (error) {
    console.error("POST schedules error:", error);

    return NextResponse.json(
      { error: "Không thể thêm lịch học" },
      { status: 500 }
    );
  }
}
