
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

// =====================================
// PUT - CẬP NHẬT MÔN HỌC
// Chỉ được sửa môn học của chính mình
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
        { error: "Bạn cần đăng nhập để sửa môn học" },
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

    // 3. Kiểm tra ID môn học
    const { id } = await context.params;
    const subjectId = Number(id);

    if (
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0
    ) {
      return NextResponse.json(
        { error: "ID môn học không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Đọc và kiểm tra dữ liệu
    const body = await request.json();

    if (
      !body ||
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        { error: "Tên môn học không được để trống" },
        { status: 400 }
      );
    }

    // 5. Chỉ sửa môn học thuộc tài khoản hiện tại
    const result = await prisma.subject.updateMany({
      where: {
        id: subjectId,
        userId,
      },
      data: {
        name: body.name.trim(),

        teacher:
          typeof body.teacher === "string"
            ? body.teacher.trim()
            : null,

        description:
          typeof body.description === "string"
            ? body.description.trim()
            : null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy môn học hoặc bạn không có quyền sửa",
        },
        { status: 404 }
      );
    }

    // 6. Lấy thông tin môn học sau khi sửa
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            schedules: true,
          },
        },
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("PUT subject error:", error);

    return NextResponse.json(
      { error: "Không thể cập nhật môn học" },
      { status: 500 }
    );
  }
}

// =====================================
// DELETE - XÓA MÔN HỌC
// Chỉ được xóa môn học của chính mình
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
        { error: "Bạn cần đăng nhập để xóa môn học" },
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

    // 3. Kiểm tra ID môn học
    const { id } = await context.params;
    const subjectId = Number(id);

    if (
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0
    ) {
      return NextResponse.json(
        { error: "ID môn học không hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Tìm môn học của tài khoản hiện tại
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            schedules: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy môn học hoặc bạn không có quyền xóa",
        },
        { status: 404 }
      );
    }

    // 5. Kiểm tra nhiệm vụ và lịch học liên quan
    if (
      subject._count.tasks > 0 ||
      subject._count.schedules > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa môn học đang có nhiệm vụ hoặc lịch học. Vui lòng xóa dữ liệu liên quan trước.",
        },
        { status: 409 }
      );
    }

    // 6. Chỉ xóa môn học của người đăng nhập
    const result = await prisma.subject.deleteMany({
      where: {
        id: subjectId,
        userId,
        tasks: {
          none: {},
        },
        schedules: {
          none: {},
        },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa môn học vì dữ liệu đã thay đổi",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Xóa môn học thành công",
    });
  } catch (error) {
    console.error("DELETE subject error:", error);

    return NextResponse.json(
      { error: "Không thể xóa môn học" },
      { status: 500 }
    );
  }
}
