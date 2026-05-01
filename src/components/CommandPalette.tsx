import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, CheckSquare, House, User, LogOut } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/lib/auth";

/**
 * Global command palette (⌘K / Ctrl+K).
 *
 * - Mounted once near the root so it works on every authenticated page.
 * - Respects prefers-reduced-motion via the global rule in styles.css.
 * - Only renders interactive auth items when a user is logged in.
 */
export function CommandPalette() {
  // Opens immediately on mount: the lazy wrapper only mounts after the user
  // has already pressed ⌘K, so the palette should be visible right away.
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    // Defer slightly so the dialog close animation can start before route swap.
    requestAnimationFrame(fn);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Busque uma ação ou página…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Navegar">
          <CommandItem
            onSelect={() => run(() => navigate({ to: "/" }))}
            value="início home dashboard"
          >
            <House />
            <span>Início</span>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => navigate({ to: "/chat" }))}
            value="chat ia perguntar"
          >
            <MessageCircle />
            <span>Chat IA</span>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => navigate({ to: "/checklist" }))}
            value="checklist tarefas"
          >
            <CheckSquare />
            <span>Checklist</span>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => navigate({ to: "/profile" }))}
            value="perfil conta"
          >
            <User />
            <span>Perfil</span>
          </CommandItem>
        </CommandGroup>

        {user && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Conta">
              <CommandItem
                onSelect={() =>
                  run(() => {
                    logout();
                    navigate({ to: "/login" });
                  })
                }
                value="sair logout deslogar"
              >
                <LogOut />
                <span>Sair</span>
                <CommandShortcut>⇧⌘Q</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
