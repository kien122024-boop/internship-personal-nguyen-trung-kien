
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const validPriorities = ["LOW", "MEDIUM", "HIGH"];
const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

// =====================================
// GET - LẤY NHIỆM VỤ CỦA NGƯỜI ĐĂNG NHẬP
// =====================================
export async function GET(request: NextRequest) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để xem nhiệm vụ" },
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

    // 3. Chỉ lấy nhiệm vụ thuộc môn học của tài khoản
    const tasks = await prisma.task.findMany({
      where: {
        subject: {
          userId,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);

    return NextResponse.json(
      { error: "Không thể tải danh sách nhiệm vụ" },
      { status: 500 }
    );
  }
}

// =====================================
// POST - THÊM NHIỆM VỤ
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
        { error: "Bạn cần đăng nhập để thêm nhiệm vụ" },
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

    // 3. Đọc dữ liệu gửi lên
    const body = await request.json();

    // 4. Kiểm tra tên nhiệm vụ
    if (
      typeof body?.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        { error: "Tên nhiệm vụ không được để trống" },
        { status: 400 }
      );
    }

    // 5. Kiểm tra ID môn học
    const subjectId = Number(body?.subjectId);

    if (
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0
    ) {
      return NextResponse.json(
        { error: "Vui lòng chọn môn học hợp lệ" },
        { status: 400 }
      );
    }

    // 6. Kiểm tra môn học có thuộc tài khoản không
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

    // 7. Kiểm tra độ ưu tiên và trạng thái
    const priority = body.priority ?? "MEDIUM";
    const status = body.status ?? "TODO";

    if (
      typeof priority !== "string" ||
      !validPriorities.includes(priority)
    ) {
      return NextResponse.json(
        { error: "Độ ưu tiên không hợp lệ" },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Trạng thái nhiệm vụ không hợp lệ" },
        { status: 400 }
      );
    }

    // 8. Kiểm tra ngày hết hạn
    let dueDate: Date | null = null;

    if (body.dueDate) {
      if (
        typeof body.dueDate !== "string" ||
        !body.dueDate.trim()
      ) {
        return NextResponse.json(
          { error: "Ngày hết hạn không hợp lệ" },
          { status: 400 }
        );
      }

      dueDate = new Date(body.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: "Ngày hết hạn không hợp lệ" },
          { status: 400 }
        );
      }
    }

    // 9. Tạo nhiệm vụ mới
    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),

        description:
          typeof body.description === "string"
            ? body.description.trim()
            : null,

        subjectId: subject.id,
        priority,
        status,
        dueDate,
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json(task, {
      status: 201,
    });
  } catch (error) {
    console.error("POST tasks error:", error);

    return NextResponse.json(
      { error: "Không thể thêm nhiệm vụ" },
      { status: 500 }
    );
  }
}
