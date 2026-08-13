import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocked rather than exercised against live DNS: this module's job is to
// classify resolver *outcomes* (records found / definitively none / errored)
// into accept-or-reject correctly — that's deterministic and shouldn't
// depend on network conditions or a specific domain's real DNS records.
const resolveMx = vi.fn();

vi.mock("node:dns/promises", () => ({
  default: {
    resolveMx: (...args: unknown[]) => resolveMx(...args),
  },
}));

const { domainAcceptsMail } = await import("../src/lib/emailDomain.js");

function notFound() {
  const err = new Error("not found") as Error & { code: string };
  err.code = "ENOTFOUND";
  return err;
}

function timeout() {
  const err = new Error("timeout") as Error & { code: string };
  err.code = "ETIMEOUT";
  return err;
}

beforeEach(() => {
  resolveMx.mockReset();
});

describe("domainAcceptsMail", () => {
  it("accepts when MX records exist", async () => {
    resolveMx.mockResolvedValue([{ exchange: "mail.example.com", priority: 10 }]);
    await expect(domainAcceptsMail("user@example.com")).resolves.toBe(true);
  });

  it("rejects when MX records are definitively absent (e.g. a parked domain with only an A record)", async () => {
    resolveMx.mockRejectedValue(notFound());
    await expect(domainAcceptsMail("user@example.com")).resolves.toBe(false);
  });

  it("fails open when the MX lookup errors inconclusively", async () => {
    resolveMx.mockRejectedValue(timeout());
    await expect(domainAcceptsMail("user@example.com")).resolves.toBe(true);
  });

  it("rejects an email with no domain part", async () => {
    await expect(domainAcceptsMail("not-an-email")).resolves.toBe(false);
  });
});
