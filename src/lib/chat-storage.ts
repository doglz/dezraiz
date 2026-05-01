import { supabase } from "./supabase";

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Active chat preference stays local — it's a UI preference, not user data.
const ACTIVE_KEY = "dezraiz.chats.active.v1";

async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function listChats(): Promise<ChatSession[]> {
  const uid = await currentUserId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title ?? null,
    messages: [],
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }));
}

export async function getChat(id: string): Promise<ChatSession | null> {
  const uid = await currentUserId();
  if (!uid) return null;

  const [sessionRes, messagesRes] = await Promise.all([
    supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", uid)
      .single(),
    supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (sessionRes.error || !sessionRes.data) return null;
  const row = sessionRes.data;
  const msgs = messagesRes.data ?? [];

  return {
    id: row.id,
    title: row.title ?? null,
    messages: msgs.map((m) => ({ role: m.role as "user" | "ai", text: m.content })),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function createChat(initialMessages: ChatMessage[] = []): Promise<ChatSession> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Usuário não autenticado.");
  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .insert({ user_id: uid, created_at: now, updated_at: now })
    .select("id, title, created_at, updated_at")
    .single();

  if (sessionError || !session) throw new Error(sessionError?.message ?? "Failed to create chat");

  if (initialMessages.length > 0) {
    await supabase.from("chat_messages").insert(
      initialMessages.map((m) => ({
        session_id: session.id,
        role: m.role,
        content: m.text,
      })),
    );
  }

  return {
    id: session.id,
    title: session.title ?? null,
    messages: initialMessages,
    createdAt: new Date(session.created_at).getTime(),
    updatedAt: new Date(session.updated_at).getTime(),
  };
}

export async function updateChat(
  id: string,
  patch: Partial<Pick<ChatSession, "messages" | "title">>,
): Promise<ChatSession | null> {
  const now = new Date().toISOString();

  if (patch.messages !== undefined) {
    // Delete existing messages and re-insert (simpler than diffing)
    await supabase.from("chat_messages").delete().eq("session_id", id);
    if (patch.messages.length > 0) {
      await supabase.from("chat_messages").insert(
        patch.messages.map((m) => ({
          session_id: id,
          role: m.role,
          content: m.text,
        })),
      );
    }
  }

  const updatePayload: Record<string, unknown> = { updated_at: now };
  if (patch.title !== undefined) updatePayload.title = patch.title;

  const { data, error } = await supabase
    .from("chat_sessions")
    .update(updatePayload)
    .eq("id", id)
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title ?? null,
    messages: patch.messages ?? [],
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function deleteChat(id: string): Promise<void> {
  await supabase.from("chat_sessions").delete().eq("id", id);
  if (getActiveChatId() === id) setActiveChatId(null);
}

export function getActiveChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveChatId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function chatTitle(chat: Pick<ChatSession, "title" | "messages">): string {
  if (chat.title && chat.title.trim()) return chat.title.trim();
  const firstUser = chat.messages.find((m) => m.role === "user");
  if (firstUser) {
    const t = firstUser.text.trim().replace(/\s+/g, " ");
    return t.length > 40 ? t.slice(0, 40) + "…" : t;
  }
  return "Nova conversa";
}

export function formatChatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
