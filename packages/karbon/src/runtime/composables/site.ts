import type { GetSiteQuery } from '../api/site'
import { loadStoripressPayloadWithURL, useStaticAsyncState } from '#imports'

export enum SocialMediaKey {
  Geneva = 'Geneva',
  Reddit = 'Reddit',
  TikTok = 'TikTok',
  Twitter = 'Twitter',
  YouTube = 'YouTube',
  Facebook = 'Facebook',
  LinkedIn = 'LinkedIn',
  Whatsapp = 'Whatsapp',
  Instagram = 'Instagram',
  Pinterest = 'Pinterest',
}

export interface Site {
  name: string
  /**
   * @deprecated use `name`
   */
  publicationName: string
  logo: GetSiteQuery['site']['logo']
  /**
   * @deprecated use `socials`
   */
  socialLinks: Record<SocialMediaKey, string>
  socials: Record<SocialMediaKey, string>
  favicon?: string | null
  timezone: string
  plan: string
  lang: string
}

export async function getSite(): Promise<Partial<Site>> {
  const site = (await loadStoripressPayloadWithURL('_site')) as GetSiteQuery['site']
  const { name: publicationName, logo, socials, favicon, timezone, plan, lang } = site || {}
  const socialLinks: Record<SocialMediaKey, string> = JSON.parse(socials || '{}')

  return {
    name: publicationName,
    publicationName,
    logo,
    socials: socialLinks,
    socialLinks,
    favicon,
    timezone,
    plan,
    lang,
  }
}

export function useSite() {
  return useStaticAsyncState('site', getSite)
}
