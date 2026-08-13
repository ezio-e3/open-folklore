import dns from "node:dns/promises";

// Timeout budget for the DNS call. Registration must not hang the request —
// on flaky/slow resolvers, a lookup for a genuinely nonexistent domain was
// observed taking 25-30s to fail here, far too slow for a signup form. A
// timeout is treated as inconclusive (see fail-open below), not as "domain
// invalid".
const LOOKUP_TIMEOUT_MS = 2500;

class LookupTimeout extends Error {}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new LookupTimeout()), LOOKUP_TIMEOUT_MS);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// Checks the email's domain has a real mail exchanger — not that the exact
// mailbox exists (that requires actually sending a message and getting a
// click-through confirmation, deliberately out of scope here; see
// docs/phase9-technical-debt.md). Catches the case a user actually hit:
// registering with an obviously fake/typo'd domain that passed Zod's
// format-only .email() check.
//
// Deliberately MX-only, not falling back to A/AAAA (RFC 5321's implicit-MX
// rule): that fallback was tried first and reverted after real-world
// testing found it let through domains like a parked/for-sale domain that
// resolves to a parking-page A record but plainly runs no mail service —
// exactly the kind of fake-looking domain this check exists to catch. A
// domain that genuinely relies on implicit MX for real mail is now rare
// enough that the false negative it would cause is worth it for the much
// more common false positive it prevented.
//
// Fails OPEN on any inconclusive result (timeout, resolver issue, etc.)
// rather than blocking registration over a transient DNS problem unrelated
// to whether the domain is real — only a *definitive* "no MX records"
// result rejects.
export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const mx = await withTimeout(dns.resolveMx(domain));
    return mx.length > 0;
  } catch (err) {
    if (!isDefinitiveNoRecords(err)) return true; // inconclusive — fail open
    return false;
  }
}

function isDefinitiveNoRecords(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}
