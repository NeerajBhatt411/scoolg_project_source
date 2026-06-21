// Auto-registers a school's public-website subdomain (<slug>.scoolg.com) on the
// Vercel template project, so the site goes live without any manual per-school
// work. Routing is handled by a one-time wildcard CNAME (*.scoolg.com) in DNS;
// this call just tells Vercel to serve + issue SSL for that exact host.
//
// Safe by design:
//  - No-op (returns skipped) unless VERCEL_TOKEN + VERCEL_PROJECT_ID are set.
//  - Never throws — onboarding must never break because of this.
//  - Idempotent — "already in use" is treated as success.
//
// Required env (set on the backend host, e.g. Netlify):
//   VERCEL_TOKEN        – a Vercel API token (Account → Settings → Tokens)
//   VERCEL_PROJECT_ID   – the template project's Project ID (Project → Settings → General)
//   VERCEL_TEAM_ID      – (optional) only if the project lives under a Team
//   SITE_ROOT_DOMAIN    – (optional) defaults to "scoolg.com"

const VERCEL_API = 'https://api.vercel.com';

export const registerSchoolDomain = async (slug) => {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    const rootDomain = process.env.SITE_ROOT_DOMAIN || 'scoolg.com';

    if (!slug) return { ok: false, skipped: 'no-slug' };
    if (!token || !projectId) {
        console.log('ℹ️ Vercel domain auto-register skipped (VERCEL_TOKEN / VERCEL_PROJECT_ID not set)');
        return { ok: false, skipped: 'no-config' };
    }

    const domain = `${slug}.${rootDomain}`;
    const url = `${VERCEL_API}/v10/projects/${projectId}/domains${teamId ? `?teamId=${teamId}` : ''}`;

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: domain }),
        });
        const body = await resp.json().catch(() => ({}));

        const alreadyThere =
            body?.error?.code === 'domain_already_in_use' ||
            body?.error?.code === 'domain_already_exists' ||
            resp.status === 409;

        if (resp.ok || alreadyThere) {
            console.log(`✅ Vercel website domain ready: ${domain}`);
            return { ok: true, domain };
        }

        console.error(`❌ Vercel domain add failed (${resp.status}) for ${domain}:`, body?.error?.message || body);
        return { ok: false, domain, error: body?.error?.message || `HTTP ${resp.status}` };
    } catch (err) {
        console.error(`❌ Vercel domain add error for ${domain}:`, err.message);
        return { ok: false, domain, error: err.message };
    }
};
