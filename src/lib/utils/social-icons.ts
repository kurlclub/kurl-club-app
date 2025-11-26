import {
  DiscordIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  SnapchatIcon,
  TiktokIcon,
  TwitterIcon,
  WebsiteIcon,
} from '@/components/shared/icons';

export interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  pattern: RegExp;
  domain: string;
}

export const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Facebook',
    icon: FacebookIcon,
    pattern: /facebook\.com|fb\.com/i,
    domain: 'facebook.com',
  },
  {
    name: 'Twitter',
    icon: TwitterIcon,
    pattern: /twitter\.com|x\.com/i,
    domain: 'twitter.com',
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
    pattern: /instagram\.com/i,
    domain: 'instagram.com',
  },
  {
    name: 'LinkedIn',
    icon: LinkedInIcon,
    pattern: /linkedin\.com/i,
    domain: 'linkedin.com',
  },
  {
    name: 'Discord',
    icon: DiscordIcon,
    pattern: /discord\.com|discord\.gg/i,
    domain: 'discord.com',
  },
  {
    name: 'Snapchat',
    icon: SnapchatIcon,
    pattern: /snapchat\.com/i,
    domain: 'snapchat.com',
  },
  {
    name: 'TikTok',
    icon: TiktokIcon,
    pattern: /tiktok\.com/i,
    domain: 'tiktok.com',
  },
];

export const defaultPlatform: SocialPlatform = {
  name: 'Website',
  icon: WebsiteIcon,
  pattern: /.*/,
  domain: '',
};

export function detectSocialPlatform(url: string): SocialPlatform {
  try {
    if (!url) return defaultPlatform;
    const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
    const platform = socialPlatforms.find((platform) =>
      platform.pattern.test(urlObject.hostname)
    );
    return platform || defaultPlatform;
  } catch {
    return defaultPlatform;
  }
}

export function validateSocialUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}
