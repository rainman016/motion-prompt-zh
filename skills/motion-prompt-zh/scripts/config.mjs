// Shared deployment configuration for the build and the standalone skill. No external dependencies.
export function resolveConfig(input) {
  const site = new URL(input.site);
  if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password || site.search || site.hash) throw new Error('site must be an HTTP(S) base URL without credentials, query or hash');
  if (!site.pathname.endsWith('/')) site.pathname += '/';
  const cleanBase = value => {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('API base must be an HTTP(S) URL without credentials, query or hash');
    return url.href.replace(/\/+$/, '');
  };
  return {
    ...input, site: site.href, skillName: 'motion-prompt-zh',
    apiBase: cleanBase(input.apiBase || new URL('api/v1', site).href),
    rawApiBase: cleanBase(input.rawApiBase || `https://raw.githubusercontent.com/${input.owner}/${input.repository}/${input.branch}/api/v1`),
  };
}
