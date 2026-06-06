import { z } from "zod";
import { UPLOAD_FOLDERS } from "@/lib/supabase/storage";

export const registerMediaSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  storagePath: z.string().trim().min(1),
  publicUrl: z.string().trim().url(),
  mimeType: z.string().trim().min(1),
  fileSize: z.number().int().positive().optional(),
  folder: z.enum(UPLOAD_FOLDERS),
});

export type RegisterMediaInput = z.infer<typeof registerMediaSchema>;
