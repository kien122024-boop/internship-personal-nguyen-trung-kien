
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  // Kết nối Better Auth với PostgreSQL thông qua Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Sử dụng ID tự tăng cho User
  advanced: {
    database: {
      generateId: "serial",
    },
  },

  // Cho phép đăng ký và đăng nhập bằng Email + Password
  emailAndPassword: {
    enabled: true,
  },
});
