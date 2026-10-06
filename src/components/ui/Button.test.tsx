import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

const DISABLED_ATTR = /\sdisabled=""/;

describe("Button loading", () => {
  it("disables the button, marks it busy and shows a decorative loader", () => {
    const html = renderToStaticMarkup(<Button loading>Guardando…</Button>);

    expect(html).toMatch(DISABLED_ATTR);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("<svg");
    expect(html).not.toContain('role="status"');
    expect(html).toContain("Guardando…");
  });

  it("renders without loader or busy state by default", () => {
    const html = renderToStaticMarkup(<Button>Guardar</Button>);

    expect(html).not.toMatch(DISABLED_ATTR);
    expect(html).not.toContain("aria-busy");
    expect(html).not.toContain("<svg");
  });

  it("keeps an explicit disabled when not loading", () => {
    const html = renderToStaticMarkup(<Button disabled>Guardar</Button>);

    expect(html).toMatch(DISABLED_ATTR);
    expect(html).not.toContain("aria-busy");
  });
});
