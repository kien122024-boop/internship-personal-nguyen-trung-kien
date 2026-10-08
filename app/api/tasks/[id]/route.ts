
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

const priorities = ["LOW", "MEDIUM", "HIGH"];
const statuses = ["TODO", "IN_PROGRESS", "DONE"];

// ======================================
// PUT - CẬP NHẬT NHIỆM VỤ
// Chỉ được sửa nhiệm vụ của mình
// ======================================
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
        { error: "Bạn cần đăng nhập để sửa nhiệm vụ" },
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

    // 3. Kiểm tra ID nhiệm vụ
    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isSafeInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { error: "ID nhiệm vụ không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Đọc dữ liệu
    const body = await request.json();

    // 5. Kiểm tra tên nhiệm vụ
    if (
      typeof body?.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        { error: "Tên nhiệm vụ không được để trống" },
        { status: 400 }
      );
    }

    // 6. Kiểm tra ID môn học
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

    // 7. Kiểm tra độ ưu tiên và trạng thái
    const priority = body.priority ?? "MEDIUM";
    const status = body.status ?? "TODO";

    if (
      typeof priority !== "string" ||
      !priorities.includes(priority)
    ) {
      return NextResponse.json(
        { error: "Độ ưu tiên không hợp lệ" },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !statuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Trạng thái nhiệm vụ không hợp lệ" },
        { status: 400 }
      );
    }

    // 8. Kiểm tra nhiệm vụ thuộc tài khoản
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        subject: {
          userId,
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy nhiệm vụ hoặc nhiệm vụ không thuộc tài khoản của bạn",
        },
        { status: 404 }
      );
    }

    // 9. Kiểm tra môn học được chọn thuộc tài khoản
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

    // 10. Kiểm tra ngày hết hạn
    let dueDate: Date | null = null;

    if (
      body.dueDate !== null &&
      body.dueDate !== undefined &&
      body.dueDate !== ""
    ) {
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

    // 11. Chỉ cập nhật nhiệm vụ thuộc tài khoản
    const result = await prisma.task.updateMany({
      where: {
        id: taskId,
        subject: {
          userId,
        },
      },
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
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy nhiệm vụ hoặc bạn không có quyền sửa",
        },
        { status: 404 }
      );
    }

    // 12. Lấy nhiệm vụ sau khi cập nhật
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        subject: {
          userId,
        },
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT task error:", error);

    return NextResponse.json(
      { error: "Không thể cập nhật nhiệm vụ" },
      { status: 500 }
    );
  }
}

// ======================================
// DELETE - XÓA NHIỆM VỤ
// Chỉ được xóa nhiệm vụ của mình
// ======================================
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
        { error: "Bạn cần đăng nhập để xóa nhiệm vụ" },
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

    // 3. Kiểm tra ID nhiệm vụ
    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isSafeInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { error: "ID nhiệm vụ không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Chỉ xóa nhiệm vụ thuộc tài khoản hiện tại
    const result = await prisma.task.deleteMany({
      where: {
        id: taskId,
        subject: {
          userId,
        },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy nhiệm vụ hoặc bạn không có quyền xóa",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Xóa nhiệm vụ thành công",
    });
  } catch (error) {
    console.error("DELETE task error:", error);

    return NextResponse.json(
      { error: "Không thể xóa nhiệm vụ" },
      { status: 500 }
    );
  }
}
