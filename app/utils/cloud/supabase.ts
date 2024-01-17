import { STORAGE_KEY } from "@/app/constant";
import { SyncStore } from "@/app/store/sync";
import { supabase } from "../supabaseClient";

export type SupabaseConfig = SyncStore["supabase"];
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

export const getSessionsFromDatabase = async (userId: string) => {
  console.log("[getSessionsFromDatabase]: ", userId);
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("session_data")
    .eq("user_id", userId);

  if (error) {
    console.error("Error retrieving user sessions:", error);
    return error;
  }

  return data[0]?.session_data || [];
};

export function createSupabaseClient(store: SyncStore) {
  const folder = STORAGE_KEY;
  const fileName = `${folder}/backup.json`;
  const config = store.webdav;
  const proxyUrl = "";

  return {
    async check() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await supabase
          .from("chat_sessions")
          .select("session_data")
          .eq("user_id", session?.user?.id);

        console.log("[Supabase] check", res.status, res.statusText);
        return [201, 200, 404, 301, 302, 307, 308].includes(res.status);
      } catch (e) {
        console.error("[Supabase] failed to check", e);
      }

      return false;
    },

    async get() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await supabase
        .from("chat_sessions")
        .select("session_data")
        .eq("user_id", session?.user?.id);
      if (res.data) {
        return res.data[0]?.session_data;
      }
    },

    async set(value: string) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await supabase.from("chat_sessions").upsert(
        {
          user_id: session?.user?.id,
          session_data: value,
          updated_at: new Date(),
        },
        {
          onConflict: "user_id",
        },
      );
    },
  };
}
