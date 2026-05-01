import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const updateProfile = vi.fn(() => new Promise<void>(() => {}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  updateProfile.mockClear();
});

vi.mock("@/components/RequireAuth", () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    useAuth: () => ({
      user: {
        firstName: "Douglas",
        lastName: "Cabral",
        email: "douglas@example.com",
      },
      loading: false,
      updateProfile,
      setOnboarding: vi.fn(),
    }),
  };
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute:
    () =>
    <T extends { component: React.ComponentType }>(config: T) =>
      config,
  useNavigate: () => vi.fn(),
}));

describe("Onboarding step navigation", () => {
  it("advances from names without waiting for the profile save", async () => {
    const user = userEvent.setup();
    const { Route } = await import("@/routes/onboarding");
    const Component = Route.component;

    render(<Component />);

    expect(screen.getByText("Vamos te conhecer")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nome"), "Douglas");
    await user.type(screen.getByLabelText("Sobrenome"), "Cabral");
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText("Seu telefone")).toBeInTheDocument();
    });
    expect(updateProfile).toHaveBeenCalledWith({
      firstName: "Douglas",
      lastName: "Cabral",
    });
  });
});
