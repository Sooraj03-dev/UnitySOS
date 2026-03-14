import { supabase } from "@/lib/supabase";

export interface VerificationDoc {
  id: string;
  file_url: string;
  file_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** Upload a verification document to Supabase Storage */
export async function uploadVerificationDoc(file: File): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in.");

  const ext = file.name.split(".").pop() || "pdf";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("verification-docs")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  // Since bucket is private, we generate a signed URL (valid 1 year)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("verification-docs")
    .createSignedUrl(fileName, 60 * 60 * 24 * 365);

  if (signedError) throw signedError;
  return signedData.signedUrl;
}

/** Submit a verification document record */
export async function submitVerification(fileUrl: string, fileName: string): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in.");

  const { error } = await supabase
    .from("verification_docs")
    .insert({
      user_id: user.id,
      file_url: fileUrl,
      file_name: fileName,
      status: "pending",
    });

  if (error) throw error;
}

/** Fetch the current user's verification submissions */
export async function fetchMyVerifications(userId: string): Promise<VerificationDoc[]> {
  const { data, error } = await supabase
    .from("verification_docs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, string>) => ({
    id: row.id,
    file_url: row.file_url,
    file_name: row.file_name,
    status: row.status as VerificationDoc["status"],
    created_at: row.created_at,
  }));
}

/** Delete a pending verification doc */
export async function deleteVerificationDoc(id: string): Promise<void> {
  const { error } = await supabase
    .from("verification_docs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
