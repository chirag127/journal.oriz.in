import type { APIRoute } from 'astro'
import { SITE_CONFIG } from '~/lib/siteConfig'

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\nSitemap: ${SITE_CONFIG.origin}/sitemap-index.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
