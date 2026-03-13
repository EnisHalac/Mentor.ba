import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function createUser({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("EMAIL_EXISTS");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: passwordHash, name: name ?? null ,roleId: 4},
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return user;
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });
}

export async function updateUser(userId, data, file) {
  const { oldPassword, newPassword, avatarFile, ...updateData } = data;

  if (oldPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("INVALID_OLD_PASSWORD");

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (file) {
    const fileExt = file.originalname.split('.').pop();
    const filePath = `public/${userId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw new Error("IMAGE_UPLOAD_FAILED");

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    updateData.avatar = publicUrlData.publicUrl;
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        portfolioUrl: true,
        role: true,
      },
    });
  } catch (error) {
    throw new Error("DATABASE_UPDATE_FAILED");
  }
}
