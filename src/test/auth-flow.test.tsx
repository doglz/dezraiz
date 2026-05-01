import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth, type Onboarding } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";

// Mock TanStack Router so RequireAuth can render in jsdom.
// <Navigate to="/x" /> renders a sentinel we can assert on.
let currentPath = "/";

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate" data-to={to} />
  ),
  useLocation: () => ({ pathname: currentPath }),
}));

const completeOnboarding: Onboarding = {
  phone: "+5511999999999",
  journeyStage: "living",
  location: { country: "Brazil", countryCode: "BR" },
  arrivalMonth: 6,
  arrivalYear: 2024,
  pregnancy: "no",
};

function setLocation(path: string) {
  currentPath = path;
}

beforeEach(() => {
  setLocation("/");
  window.localStorage.clear();
});

/* ---------- Helpers to drive the auth context ---------- */

function AuthHarness({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useAuth>) => void;
}) {
  const ctx = useAuth();
  onReady(ctx);
  return null;
}

function renderWithAuth(ui: React.ReactNode) {
  let captured: ReturnType<typeof useAuth> | null = null;
  const utils = render(
    <AuthProvider>
      <AuthHarness onReady={(c) => (captured = c)} />
      {ui}
    </AuthProvider>,
  );
  return {
    ...utils,
    getAuth: () => {
      if (!captured) throw new Error("AuthProvider did not mount");
      return captured;
    },
  };
}

/* ============================================================ */
/*                Protected routes redirect logic               */
/* ============================================================ */

describe("RequireAuth — protected routes", () => {
  it("redirects unauthenticated users to /login", async () => {
    setLocation("/profile");
    renderWithAuth(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>,
    );

    // Wait one tick — AuthProvider sets loading=false in useEffect
    await screen.findByTestId("navigate");

    const nav = screen.getByTestId("navigate");
    expect(nav).toHaveAttribute("data-to", "/login");
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("redirects authenticated user without onboarding to /onboarding", async () => {
    setLocation("/profile");
    // Pre-seed an authenticated user without onboarding
    window.localStorage.setItem(
      "dezraiz_user",
      JSON.stringify({
        firstName: "João",
        lastName: "Silva",
        email: "joao@example.com",
      }),
    );

    renderWithAuth(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>,
    );

    const nav = await screen.findByTestId("navigate");
    expect(nav).toHaveAttribute("data-to", "/onboarding");
  });

  it("does NOT redirect away from /onboarding when user has no onboarding yet", async () => {
    setLocation("/onboarding");
    window.localStorage.setItem(
      "dezraiz_user",
      JSON.stringify({
        firstName: "João",
        lastName: "Silva",
        email: "joao@example.com",
      }),
    );

    renderWithAuth(
      <RequireAuth>
        <div>onboarding-screen</div>
      </RequireAuth>,
    );

    expect(await screen.findByText("onboarding-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated and onboarded", async () => {
    setLocation("/profile");
    window.localStorage.setItem(
      "dezraiz_user",
      JSON.stringify({
        firstName: "João",
        lastName: "Silva",
        email: "joao@example.com",
        phone: "+5511999999999",
        location: completeOnboarding.location,
        onboarding: completeOnboarding,
      }),
    );

    renderWithAuth(
      <RequireAuth>
        <div>protected-content</div>
      </RequireAuth>,
    );

    expect(await screen.findByText("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("renders children for routes that don't require onboarding (requireOnboarding=false)", async () => {
    setLocation("/profile");
    window.localStorage.setItem(
      "dezraiz_user",
      JSON.stringify({
        firstName: "João",
        lastName: "Silva",
        email: "joao@example.com",
      }),
    );

    renderWithAuth(
      <RequireAuth requireOnboarding={false}>
        <div>partial-content</div>
      </RequireAuth>,
    );

    expect(await screen.findByText("partial-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

});

/* ============================================================ */
/*       Auth flow:  login → register → onboarding → /          */
/* ============================================================ */

describe("Auth flow — login / register / onboarding / home", () => {
  it("login: anonymous user → /login redirect → after login + onboarding access protected route", async () => {
    setLocation("/profile");

    const { getAuth, rerender } = renderWithAuth(
      <RequireAuth>
        <div>home</div>
      </RequireAuth>,
    );

    // 1. Initially redirected to /login
    await screen.findByTestId("navigate");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");

    // 2. User logs in (no onboarding yet) → should redirect to /onboarding
    await act(async () => {
      await getAuth().login("maria@example.com", "secret123");
    });

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/onboarding",
    );

    // 3. User completes onboarding
    await act(async () => {
      getAuth().setOnboarding(completeOnboarding);
    });

    // 4. Protected content now renders, no redirect
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();

    // Sanity: rerender keeps content
    rerender(
      <AuthProvider>
        <RequireAuth>
          <div>home</div>
        </RequireAuth>
      </AuthProvider>,
    );
    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("register: new user signs up → onboarding required → completes → access granted", async () => {
    setLocation("/checklist");

    const { getAuth } = renderWithAuth(
      <RequireAuth>
        <div>checklist-page</div>
      </RequireAuth>,
    );

    // 1. Anonymous → redirected to /login
    await screen.findByTestId("navigate");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");

    // 2. Register new user → still needs onboarding → /onboarding
    await act(async () => {
      await getAuth().register("Ana", "Costa", "ana@example.com", "pwd123!");
    });

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/onboarding",
    );

    // 3. Complete onboarding
    await act(async () => {
      getAuth().setOnboarding(completeOnboarding);
    });

    // 4. Now sees protected page
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
    expect(screen.getByText("checklist-page")).toBeInTheDocument();
  });

  it("logout returns user to /login redirect from protected pages", async () => {
    setLocation("/profile");
    window.localStorage.setItem(
      "dezraiz_user",
      JSON.stringify({
        firstName: "João",
        lastName: "Silva",
        email: "joao@example.com",
        phone: "+5511999999999",
        location: completeOnboarding.location,
        onboarding: completeOnboarding,
      }),
    );

    const { getAuth } = renderWithAuth(
      <RequireAuth>
        <div>private</div>
      </RequireAuth>,
    );

    // Starts authenticated
    expect(await screen.findByText("private")).toBeInTheDocument();

    // Log out
    await act(async () => {
      getAuth().logout();
    });

    // Now redirected to /login
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(screen.queryByText("private")).not.toBeInTheDocument();
  });

  it("persists user in localStorage after login and rehydrates", async () => {
    setLocation("/");
    const { getAuth, unmount } = renderWithAuth(<div>app</div>);

    await act(async () => {
      await getAuth().login("rehydrate@example.com", "x");
    });

    // Stored
    const stored = window.localStorage.getItem("dezraiz_user");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).email).toBe("rehydrate@example.com");

    // Unmount and remount → user is restored from localStorage
    unmount();

    setLocation("/profile");
    renderWithAuth(
      <RequireAuth requireOnboarding={false}>
        <div>after-rehydrate</div>
      </RequireAuth>,
    );

    expect(await screen.findByText("after-rehydrate")).toBeInTheDocument();
  });
});

/* ============================================================ */
/*            User-event smoke test on a tiny login form        */
/* ============================================================ */

function MiniLoginForm() {
  const { login, user } = useAuth();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await login(String(fd.get("email")), String(fd.get("password")));
      }}
    >
      <label>
        Email
        <input name="email" />
      </label>
      <label>
        Senha
        <input name="password" type="password" />
      </label>
      <button type="submit">Entrar</button>
      {user && <p>logged-as:{user.email}</p>}
    </form>
  );
}

describe("Login form interaction", () => {
  it("submitting credentials authenticates the user", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <MiniLoginForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText("Email"), "test@dezraiz.app");
    await user.type(screen.getByLabelText("Senha"), "secret");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("logged-as:test@dezraiz.app"),
    ).toBeInTheDocument();
  });
});
