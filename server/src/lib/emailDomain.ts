import dns from "node:dns/promises";

// Timeout budget per DNS call. Registration must not hang the request —
// on flaky/slow resolvers, an A/AAAA lookup for a genuinely nonexistent
// domain was observed taking 25-30s to fail here, far too slow for a
// signup form. A timeout is treated as inconclusive (see fail-open below),
// not as "domain invalid".
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

// Checks the email's domain can plausibly receive mail — not that the exact
// mailbox exists (that requires actually sending a message and getting a
// click-through confirmation, deliberately out of scope here; see
// docs/phase9-technical-debt.md). Catches the case a user actually hit:
// registering with an obviously fake/typo'd domain that passed Zod's
// format-only .email() check.
//
// Checks MX first (the normal case), falling back to A/AAAA per RFC 5321's
// implicit-MX rule (a domain with no MX but a valid host record can still
// receive mail) — some small real domains are set up exactly that way, and
// treating them as invalid would be a false positive. The fallback only
// runs when MX gave a *definitive* "no such domain" — an inconclusive MX
// result (timeout, resolver error) fails open immediately rather than
// chaining into a second, equally uncertain lookup.
//
// Fails OPEN on any inconclusive result (timeout, resolver issue, etc.)
// rather than blocking registration over a transient DNS problem unrelated
// to whether the domain is real — only a *definitive* "no records" result
// rejects.
export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const mx = await withTimeout(dns.resolveMx(domain));
    return mx.length > 0;
  } catch (err) {
    if (!isDefinitiveNoRecords(err)) return true; // inconclusive — fail open
  }

  try {
    const a = await withTimeout(dns.resolve4(domain));
    return a.length > 0;
  } catch (err) {
    if (!isDefinitiveNoRecords(err)) return true;
  }

  try {
    const aaaa = await withTimeout(dns.resolve6(domain));
    return aaaa.length > 0;
  } catch (err) {
    if (!isDefinitiveNoRecords(err)) return true;
    return false;
  }
}

function isDefinitiveNoRecords(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}
