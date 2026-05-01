import { createFileRoute } from "@tanstack/react-router";
import {
  Send,
  Sparkles,
  ArrowLeft,
  Menu,
  Plus,
  Trash2,
  Pencil,
  MessageSquare,
  Check,
  X,
  MessagesSquare,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { seo } from "@/lib/seo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type ChatMessage,
  type ChatSession,
  chatTitle,
  createChat,
  deleteChat,
  formatChatDate,
  getActiveChatId,
  getChat,
  listChats,
  setActiveChatId,
  setChatUserId,
  updateChat,
} from "@/lib/chat-storage";
import { SearchCards, type SearchCardsMeta } from "@/components/SearchCards";
import { searchNearby, getUserCoords } from "@/lib/mapbox";

export const Route = createFileRoute("/chat")({
  head: () => ({
    ...seo({
      title: "Chat IA",
      description:
        "Tire dúvidas sobre documentos, impostos, remessas e o dia a dia — esteja você planejando ir, viajando ou já morando fora — com a IA da DEZRAIZ.",
      path: "/chat",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageTransition>
          <Chat />
        </PageTransition>
      </AppShell>
    </RequireAuth>
  ),
});

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : part
  );
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${key}`} className="mt-1 space-y-0.5 pl-4">
        {listItems.map((item, j) => (
          <li key={j} className="list-disc">{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    if (/^[*-] /.test(line)) {
      listItems.push(line.slice(2));
    } else {
      flushList(idx);
      if (line.trim()) nodes.push(<p key={`p-${idx}`}>{renderInline(line)}</p>);
    }
  });
  flushList(lines.length);

  return <div className="space-y-1.5">{nodes}</div>;
}

const SUGGESTIONS = [
  "Como faço minha declaração de saída?",
  "Qual o melhor app de remessa?",
  "Como cadastrar no consulado?",
];

const WELCOME: ChatMessage = {
  role: "ai",
  text: "Olá! 👋 Posso te ajudar a planejar a mudança, organizar a viagem ou resolver a vida fora — documentos, impostos, remessas e o dia a dia. O que você quer saber?",
};

function Chat() {
  const { user } = useAuth();

  // Sync userId para o storage logo que o contexto de auth tiver o user.
  useEffect(() => {
    setChatUserId(user?.id ?? null);
  }, [user?.id]);

  // Sidebar list (metadata only, no messages)
  const [chats, setChats] = useState<ChatSession[]>([]);
  // Active chat with full messages
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [messagePlaces, setMessagePlaces] = useState<Record<number, SearchCardsMeta>>({});
  const skipFirstActiveIdEffect = useRef(true);

  // Feedback visual ao trocar/criar chat.
  const [flash, setFlash] = useState<{ kind: "switch" | "new"; label: string } | null>(null);
  const flashTimer = useRef<number | null>(null);
  const triggerFlash = (kind: "switch" | "new", label: string) => {
    setFlash({ kind, label });
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1600);
  };
  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  const refreshList = async () => {
    const all = await listChats();
    setChats(all);
  };

  const loadActiveChat = async (id: string) => {
    const chat = await getChat(id);
    setActiveChat(chat);
  };

  // Bootstrap: carrega lista quando o user estiver disponível no contexto de auth.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const all = await listChats();
      if (all.length === 0) {
        setChats([]);
        setActiveId(null);
        setActiveChat(null);
        setActiveChatId(null);
        return;
      }
      const storedActive = getActiveChatId();
      const active = (storedActive && all.find((c) => c.id === storedActive)) || all[0];
      setActiveChatId(active.id);
      setChats(all);
      setActiveId(active.id);
      await loadActiveChat(active.id);
    })();
  }, [user?.id]);

  // Load messages when active ID changes — skip first set (bootstrap handles it).
  useEffect(() => {
    if (!activeId) return;
    if (skipFirstActiveIdEffect.current) {
      skipFirstActiveIdEffect.current = false;
      return;
    }
    loadActiveChat(activeId);
    setMessagePlaces({});
  }, [activeId]);

  const send = async (text: string) => {
    if (!text.trim() || !activeChat || aiStreaming) return;

    const userMessages: ChatMessage[] = [
      ...activeChat.messages,
      { role: "user", text },
    ];
    const aiMsgIdx = userMessages.length; // index of AI reply in finalMessages
    let searchHintReceived: { category: string; label: string; emoji: string } | null = null;
    // Optimistic: add user message + empty AI placeholder
    const withPlaceholder: ChatMessage[] = [
      ...userMessages,
      { role: "ai", text: "" },
    ];
    setActiveChat((prev) => prev ? { ...prev, messages: withPlaceholder } : prev);
    setInput("");
    setAiStreaming(true);

    try {
      // Build messages for the API — Anthropic requires first message to be "user"
      const mapped = userMessages
        .filter((m) => m.text.length > 0)
        .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
      const firstUserIdx = mapped.findIndex((m) => m.role === "user");
      const apiMessages = firstUserIdx > 0 ? mapped.slice(firstUserIdx) : mapped;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession();
      const token = session?.access_token ?? supabaseKey;

      // Perfil do usuário para personalizar a IA
      const ob = user?.onboarding;
      const userProfile = ob ? {
        firstName: user?.firstName,
        journeyStage: ob.journeyStage,
        destinationCountry: ob.destinationCountry,
        destinationCity: ob.destinationCity,
        locationCountry: ob.location?.country,
        locationCity: ob.location?.city,
        arrivalMonth: ob.arrivalMonth,
        arrivalYear: ob.arrivalYear,
        mainGoal: ob.mainGoal,
        languageLevel: ob.languageLevel,
        familyStatus: ob.familyStatus,
        hasChildren: ob.hasChildren,
        visaStatus: ob.visaStatus,
        visaIntent: ob.visaIntent,
        workType: ob.workType,
        remittance: ob.remittance,
        bankAccount: ob.bankAccount,
      } : undefined;

      const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: apiMessages, profile: userProfile }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Falha na resposta da IA.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.delta) {
              aiText += parsed.delta;
              setActiveChat((prev) => {
                if (!prev) return prev;
                const msgs = [...prev.messages];
                msgs[msgs.length - 1] = { role: "ai", text: aiText };
                return { ...prev, messages: msgs };
              });
            }
            if (parsed.searchHint) {
              searchHintReceived = parsed.searchHint;
            }
          } catch {}
        }
      }

      const finalMessages: ChatMessage[] = [...userMessages, { role: "ai", text: aiText }];
      // Derive and persist title from first user message if not yet set
      const firstUser = finalMessages.find(m => m.role === "user");
      const titlePatch = (!activeChat.title && firstUser)
        ? { title: firstUser.text.trim().replace(/\s+/g, " ").slice(0, 40) + (firstUser.text.length > 40 ? "…" : "") }
        : {};
      await updateChat(activeChat.id, { messages: finalMessages, ...titlePatch });

      // Trigger Mapbox search if intent was detected
      if (searchHintReceived) {
        const { category, label, emoji } = searchHintReceived;
        setMessagePlaces((prev) => ({ ...prev, [aiMsgIdx]: { places: [], label, emoji, loading: true } }));
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
        if (mapboxToken) {
          try {
            // Try GPS first, fall back to onboarding location
            let coords = await getUserCoords();
            if (!coords) {
              const ob = user?.onboarding;
              const loc = ob?.location ?? (ob?.journeyStage === "living" ? undefined : undefined);
              if (ob?.location?.latitude && ob?.location?.longitude) {
                coords = { lat: ob.location.latitude, lng: ob.location.longitude };
              }
            }
            if (coords) {
              const places = await searchNearby(category, coords, mapboxToken);
              setMessagePlaces((prev) => ({ ...prev, [aiMsgIdx]: { places, label, emoji, loading: false } }));
            } else {
              setMessagePlaces((prev) => ({ ...prev, [aiMsgIdx]: { places: [], label, emoji, loading: false, noLocation: true } }));
            }
          } catch {
            setMessagePlaces((prev) => ({ ...prev, [aiMsgIdx]: { places: [], label, emoji, loading: false, noLocation: true } }));
          }
        } else {
          setMessagePlaces((prev) => ({ ...prev, [aiMsgIdx]: { places: [], label, emoji, loading: false, noLocation: true } }));
        }
      }
    } catch {
      // Revert placeholder on error
      setActiveChat((prev) => {
        if (!prev) return prev;
        const msgs = [...prev.messages];
        msgs[msgs.length - 1] = {
          role: "ai",
          text: "Não consegui conectar com a IA. Tente novamente.",
        };
        return { ...prev, messages: msgs };
      });
    } finally {
      setAiStreaming(false);
      await refreshList();
    }
  };

  // Verdadeiro se a conversa só tem o welcome (nenhuma mensagem do usuário).
  const isChatUnused = (chat: ChatSession | null) =>
    !!chat && !chat.messages.some((m) => m.role === "user");

  const handleNewChat = async () => {
    if (isChatUnused(activeChat)) {
      setDrawerOpen(false);
      setInput("");
      triggerFlash("switch", "Já está em uma conversa nova");
      return;
    }
    try {
      setChatError(null);
      const fresh = await createChat([WELCOME]);
      setActiveChatId(fresh.id);
      setActiveId(fresh.id);
      setActiveChat(fresh);
      await refreshList();
      setDrawerOpen(false);
      setInput("");
      triggerFlash("new", "Nova conversa criada");
    } catch {
      setChatError("Não foi possível criar a conversa. Verifique sua conexão.");
    }
  };

  const handleStartFirstChat = async () => {
    try {
      setChatError(null);
      const fresh = await createChat([WELCOME]);
      setActiveChatId(fresh.id);
      setActiveId(fresh.id);
      setActiveChat(fresh);
      await refreshList();
      setInput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[chat] createChat failed:", msg);
      setChatError(msg);
    }
  };

  const handleSelectChat = async (id: string) => {
    if (id === activeId) {
      setDrawerOpen(false);
      return;
    }
    const chat = chats.find((c) => c.id === id);
    setActiveChatId(id);
    setActiveId(id);
    setDrawerOpen(false);
    triggerFlash("switch", chat ? chatTitle(chat) : "Conversa aberta");
    // loadActiveChat fires via the activeId useEffect
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const wasActive = confirmDeleteId === activeId;
    await deleteChat(confirmDeleteId);
    setConfirmDeleteId(null);

    const remaining = await listChats();
    setChats(remaining);

    if (wasActive) {
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
        setActiveId(remaining[0].id);
        // loadActiveChat fires via the activeId useEffect
      } else {
        setActiveChatId(null);
        setActiveId(null);
        setActiveChat(null);
      }
    }
  };

  const startRename = (chat: ChatSession) => {
    setRenamingId(chat.id);
    setRenameValue(chatTitle(chat));
    setTimeout(() => renameInputRef.current?.select(), 30);
  };

  const commitRename = async () => {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    await updateChat(renamingId, { title: trimmed.length > 0 ? trimmed : null });
    if (renamingId === activeId) {
      setActiveChat((prev) => prev ? { ...prev, title: trimmed.length > 0 ? trimmed : null } : prev);
    }
    setRenamingId(null);
    setRenameValue("");
    await refreshList();
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const messages = activeChat?.messages ?? [];

  return (
    <div className="-mx-5 flex min-h-[calc(100dvh-160px)] flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/"
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-transform active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1
            key={activeId ?? "none"}
            className="animate-fade-in truncate text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--color-foreground)]"
          >
            {activeChat ? chatTitle(activeChat) : "Chat IA"}
          </h1>
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            Sua dúvida, nossa resposta
          </p>
        </div>
        {activeChat && (
          <button
            type="button"
            onClick={handleNewChat}
            aria-label="Nova conversa"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-transform active:scale-95"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Histórico de conversas"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] transition-transform active:scale-95"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </header>

      {/* Toast flutuante de troca/criação */}
      {flash && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-4 z-50 flex -translate-x-1/2 animate-fade-in items-center gap-2 rounded-full bg-[var(--color-foreground)] px-4 py-2 text-[12.5px] font-semibold text-[var(--color-background)] shadow-[var(--shadow-elev-3)]"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        >
          {flash.kind === "new" ? (
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
          ) : (
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
          )}
          <span className="max-w-[60vw] truncate">{flash.label}</span>
        </div>
      )}

      {/* Conteúdo: empty state quando não há conversa ativa */}
      {!activeChat ? (
        <div
          className="flex flex-1 animate-fade-in flex-col items-center justify-center px-6 text-center"
          style={{
            paddingBottom:
              "calc(var(--bottom-nav-offset, 88px) + env(safe-area-inset-bottom, 0px) + 24px)",
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-[var(--shadow-elev-1)]">
            <MessagesSquare className="h-7 w-7" strokeWidth={2.2} />
          </div>
          <h2 className="mt-5 text-[18px] font-extrabold tracking-[-0.01em] text-[var(--color-foreground)]">
            Nenhuma conversa ainda
          </h2>
          <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-[var(--color-muted-foreground)]">
            Comece uma conversa com a IA da DEZRAIZ para tirar dúvidas sobre
            documentos, impostos, remessas e o dia a dia fora do Brasil.
          </p>
          <button
            type="button"
            onClick={handleStartFirstChat}
            className="mt-6 flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-elev-2)] transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            Iniciar chat
          </button>
          {chatError && (
            <p className="mt-4 max-w-[280px] text-center text-[13px] text-[var(--color-state-error)]">
              {chatError}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            key={activeId ?? "none"}
            className="flex-1 animate-fade-in space-y-3 px-5"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
            }}
          >
            {messages.map((m, i) => {
              const isStreamingPlaceholder = aiStreaming && i === messages.length - 1 && m.role === "ai";
              const cards = m.role === "ai" ? messagePlaces[i] : undefined;
              return (
                <div key={i}>
                  <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        "max-w-[85%] px-4 py-3 text-[14px] leading-relaxed " +
                        (m.role === "user"
                          ? "rounded-[1.5rem] rounded-br-md bg-[var(--color-foreground)] text-[var(--color-background)] shadow-[var(--shadow-elev-1)]"
                          : "rounded-[1.5rem] rounded-bl-md bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)]")
                      }
                    >
                      {isStreamingPlaceholder && m.text === "" ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted-foreground)] [animation-delay:0ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted-foreground)] [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted-foreground)] [animation-delay:300ms]" />
                        </span>
                      ) : m.role === "ai" ? (
                        <MarkdownText text={m.text} />
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                  {cards && (
                    <SearchCards
                      places={cards.places}
                      label={cards.label}
                      emoji={cards.emoji}
                      loading={cards.loading}
                      noLocation={cards.noLocation}
                    />
                  )}
                </div>
              );
            })}

            {messages.length === 1 && (
              <div className="space-y-2.5 pt-5">
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Sugestões
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full rounded-full bg-[var(--color-card)] px-5 py-4 text-left text-[14px] font-medium text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-all active:scale-[0.99]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="fixed inset-x-0 z-40 mx-auto max-w-screen-sm px-5 pb-0 pt-2"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 48px)" }}
          >
            <div className={
              "flex items-center gap-2 rounded-full bg-[var(--color-card)] py-2 pl-5 pr-2 shadow-[var(--shadow-elev-3)] transition-opacity " +
              (aiStreaming ? "opacity-60" : "")
            }>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={aiStreaming ? "IA respondendo…" : "Pergunte algo..."}
                disabled={aiStreaming}
                className="h-10 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={aiStreaming}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Drawer de histórico */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-sm border-r-0 bg-[var(--color-background)] p-0"
        >
          <SheetHeader className="border-b border-[var(--color-border)] px-5 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-[16px] font-extrabold text-[var(--color-foreground)]">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              Suas conversas
            </SheetTitle>
            <SheetDescription className="sr-only">Histórico de conversas com a IA</SheetDescription>
          </SheetHeader>

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-elev-1)] transition-transform active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Nova conversa
            </button>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-6">
            {chats.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-[var(--color-muted-foreground)]">
                Nenhuma conversa ainda.
              </p>
            )}

            {chats.map((chat) => {
              const isActive = chat.id === activeId;
              const isRenaming = renamingId === chat.id;
              return (
                <div
                  key={chat.id}
                  className={
                    "group flex items-center gap-2 rounded-2xl px-2.5 py-2 transition-colors " +
                    (isActive
                      ? "bg-[var(--color-primary-soft)]"
                      : "hover:bg-[var(--color-card)]")
                  }
                >
                  {isRenaming ? (
                    <>
                      <MessageSquare
                        className="h-4 w-4 flex-none text-[var(--color-muted-foreground)]"
                        strokeWidth={2}
                      />
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        className="h-8 flex-1 rounded-lg bg-[var(--color-card)] px-2 text-[13px] text-[var(--color-foreground)] outline-none ring-1 ring-[var(--color-primary)]"
                      />
                      <button
                        type="button"
                        onClick={commitRename}
                        aria-label="Salvar"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        aria-label="Cancelar"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-muted-foreground)]"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.6} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectChat(chat.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <MessageSquare
                          className={
                            "h-4 w-4 flex-none " +
                            (isActive
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-muted-foreground)]")
                          }
                          strokeWidth={2}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={
                              "block truncate text-[13.5px] " +
                              (isActive
                                ? "font-semibold text-[var(--color-foreground)]"
                                : "font-medium text-[var(--color-foreground)]")
                            }
                          >
                            {chatTitle(chat)}
                          </span>
                          <span className="block text-[11px] text-[var(--color-muted-foreground)]">
                            {formatChatDate(chat.updatedAt)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(chat)}
                        aria-label="Renomear"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(chat.id)}
                        aria-label="Excluir"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-state-error)]/10 hover:text-[var(--color-state-error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmação de exclusão */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-sm overflow-hidden">
          <div className="px-6 pb-2 pt-6 text-center">
            <DialogTitle className="text-[17px] font-bold">
              Excluir esta conversa?
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] text-[var(--color-muted-foreground)]">
              Esta ação não pode ser desfeita. As mensagens serão removidas
              permanentemente.
            </DialogDescription>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] px-6 pb-6 pt-4">
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="h-12 w-full rounded-xl bg-[var(--color-state-error)] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="h-12 w-full rounded-xl bg-[var(--color-secondary)] text-[15px] font-semibold text-[var(--color-foreground)] transition-opacity hover:opacity-80 active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
