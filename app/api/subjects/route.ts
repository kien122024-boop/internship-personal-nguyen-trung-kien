
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// =====================================
// GET - LẤY MÔN HỌC CỦA NGƯỜI ĐĂNG NHẬP
// =====================================
export async function GET(request: NextRequest) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để xem môn học" },
        { status: 401 }
      );
    }

    // 2. Lấy ID người dùng
    const userId = Number(session.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Thông tin tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 3. Chỉ lấy môn học của tài khoản hiện tại
    const subjects = await prisma.subject.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET subjects error:", error);

    return NextResponse.json(
      { error: "Không thể tải danh sách môn học" },
      { status: 500 }
    );
  }
}

// =====================================
// POST - THÊM MÔN HỌC
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
        { error: "Bạn cần đăng nhập để thêm môn học" },
        { status: 401 }
      );
    }

    // 2. Lấy ID người dùng
    const userId = Number(session.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Thông tin tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 3. Đọc dữ liệu
    const body = await request.json();

    // 4. Kiểm tra tên môn học
    if (
      typeof body?.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        { error: "Tên môn học không được để trống" },
        { status: 400 }
      );
    }

    // 5. Tạo môn học cho tài khoản đang đăng nhập
    const subject = await prisma.subject.create({
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

    return NextResponse.json(subject, {
      status: 201,
    });
  } catch (error) {
    console.error("POST subjects error:", error);

    return NextResponse.json(
      { error: "Không thể thêm môn học" },
      { status: 500 }
    );
  }
}
