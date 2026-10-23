import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({ revert: vi.fn() })),
}));

const renderLanding = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

describe("LandingPage", () => {
  it("renderiza el hero y las secciones", () => {
    renderLanding();

    expect(screen.getByRole("heading", { name: /De la idea al negocio/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "¿Cómo funciona?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "¿Por qué BID?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "¿Tienes una idea?" })).toBeInTheDocument();
  });

  it("mantiene los enlaces de navegación", () => {
    renderLanding();

    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Comenzar gratis" })).toHaveAttribute(
      "href",
      "/login?demo=1",
    );
    expect(screen.getByRole("link", { name: "Comenzar ahora" })).toHaveAttribute("href", "/login");
  });
});
