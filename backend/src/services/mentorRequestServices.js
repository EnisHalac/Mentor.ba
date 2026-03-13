import { prisma } from "../prisma.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function createMentorRequest(userId, data, files) {
  const existingRequest = await prisma.mentorRequest.findUnique({
    where: { userId },
  });

  if (existingRequest && existingRequest.status === "PENDING") {
    throw new Error("ALREADY_PENDING");
  }

  const { subject, experience, education, linkedinUrl, githubUrl } = data;
  const proofFilesPaths = [];

  if (files && Array.isArray(files)) {
    for (const file of files) {
      if (!file.buffer) continue;

      const fileExt = file.originalname?.split('.').pop() || 'bin';
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("mentor-proofs")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error("UPLOAD_FAILED");
      }

      proofFilesPaths.push(String(fileName));
    }
  }

  return await prisma.mentorRequest.upsert({
    where: { userId },
    update: {
      subject,
      experience,
      education,
      linkedinUrl,
      githubUrl,
      proofFiles: proofFilesPaths,
      status: "PENDING",
    },
    create: {
      userId,
      subject,
      experience,
      education,
      linkedinUrl,
      githubUrl,
      proofFiles: proofFilesPaths,
      status: "PENDING",
    },
  });
}