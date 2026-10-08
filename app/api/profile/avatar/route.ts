
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    // 1. Kiểm tra đăng nhập
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập" },
        { status: 401 }
      );
    }

    // 2. Kiểm tra cấu hình Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Thiếu cấu hình Cloudinary");

      return NextResponse.json(
        { error: "Máy chủ chưa cấu hình lưu ảnh" },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // 3. Đọc ảnh từ form
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn ảnh đại diện" },
        { status: 400 }
      );
    }

    // 4. Kiểm tra định dạng ảnh
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP" },
        { status: 400 }
      );
    }

    // 5. Kiểm tra dung lượng
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ảnh phải có dung lượng từ 1 byte đến 2 MB" },
        { status: 400 }
      );
    }

    // 6. Đọc nội dung ảnh
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Kiểm tra chữ ký định dạng ảnh
    const isJpeg =
      file.type === "image/jpeg" &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const isPng =
      file.type === "image/png" &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          137, 80, 78, 71, 13, 10, 26, 10,
        ])
      );

    const isWebp =
      file.type === "image/webp" &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: "Nội dung file không phải ảnh hợp lệ" },
        { status: 400 }
      );
    }

    // 7. Upload ảnh lên Cloudinary
    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "study-planner/avatars",
          resource_type: "image",
          transformation: [
            {
              width: 400,
              height: 400,
              crop: "fill",
              gravity: "auto",
            },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload thất bại"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(buffer);
    });

    // 8. Cập nhật ảnh cho tài khoản đang đăng nhập
    try {
      await prisma.user.update({
        where: {
          id: Number(session.user.id),
        },
        data: {
          image: uploaded.secure_url,
        },
      });
    } catch (databaseError) {
      // Xóa ảnh vừa upload nếu không lưu được vào database
      await cloudinary.uploader
        .destroy(uploaded.public_id)
        .catch(console.error);

      throw databaseError;
    }

    return NextResponse.json({
      message: "Cập nhật ảnh đại diện thành công",
      image: uploaded.secure_url,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    return NextResponse.json(
      { error: "Không thể cập nhật ảnh đại diện" },
      { status: 500 }
    );
  }
}
