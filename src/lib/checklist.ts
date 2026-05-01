import { supabase } from "./supabase";

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  done: boolean;
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "doc-passport", title: "Passaporte válido", description: "Verifique a validade (mínimo 6 meses)", done: false },
  { id: "doc-visa",     title: "Visto / autorização de residência", done: false },
  { id: "tax-cpf",     title: "Manter CPF regular na Receita Federal", done: true },
  { id: "tax-drei",    title: "Declaração de Saída Definitiva (se aplicável)", done: false },
  { id: "consul",      title: "Cadastro no consulado brasileiro", done: false },
  { id: "health",      title: "Seguro saúde local", done: false },
  { id: "bank",        title: "Abrir conta bancária local", done: false },
  { id: "remit",       title: "Configurar app de remessas (Wise, Remessa Online)", done: false },
];

async function currentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function loadChecklist(): Promise<ChecklistItem[]> {
  const uid = await currentUserId();
  if (!uid) return DEFAULT_CHECKLIST;

  const { data, error } = await supabase
    .from("checklist_items")
    .select("item_key, title, description, done")
    .eq("user_id", uid)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return DEFAULT_CHECKLIST;

  return data.map((row) => ({
    id: row.item_key,
    title: row.title,
    description: row.description ?? undefined,
    done: row.done,
  }));
}

export async function saveChecklist(items: ChecklistItem[]): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;

  const now = new Date().toISOString();
  const rows = items.map((item, idx) => ({
    user_id: uid,
    item_key: item.id,
    title: item.title,
    description: item.description ?? null,
    done: item.done,
    sort_order: idx,
    updated_at: now,
  }));

  await supabase
    .from("checklist_items")
    .upsert(rows, { onConflict: "user_id,item_key" });
}

export async function toggleChecklistItem(itemId: string, done: boolean): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;

  await supabase
    .from("checklist_items")
    .update({ done, updated_at: new Date().toISOString() })
    .eq("user_id", uid)
    .eq("item_key", itemId);
}
