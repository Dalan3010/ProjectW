import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";

const renderLogin = (entry = "/login") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LoginPage />
    </MemoryRouter>,
  );

describe("LoginPage", () => {
  it("muestra el formulario por defecto", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Bienvenido de vuelta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.queryByText("¡Sesión iniciada!")).not.toBeInTheDocument();
  });

  it("entra como demo", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Entrar como demo" }));

    expect(screen.getByText("¡Sesión iniciada!")).toBeInTheDocument();
    expect(screen.getByText(/Has entrado con la cuenta demo/)).toBeInTheDocument();
  });

  it("entra directo a la demo con ?demo=1", () => {
    renderLogin("/login?demo=1");

    expect(screen.getByText("¡Sesión iniciada!")).toBeInTheDocument();
    expect(screen.getByText(/Has entrado con la cuenta demo/)).toBeInTheDocument();
  });

  it("no inicia sesión con el formulario vacío", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.queryByText("¡Sesión iniciada!")).not.toBeInTheDocument();
  });

  it("inicia sesión con credenciales válidas", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Correo electrónico"), "demo@bid.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByText("¡Sesión iniciada!")).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido de vuelta a BID/)).toBeInTheDocument();
  });
});
