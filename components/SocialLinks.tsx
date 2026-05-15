

import React from 'react';
import { Instagram, Linkedin, MessageCircle, ExternalLink } from 'lucide-react';
import { SocialLink } from '../types';

// Icon map: maps platform string to appropriate icon component or SVG
const getSocialIcon = (platform: string, className: string = 'w-5 h-5') => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    default:
      return <ExternalLink className={className} />;
  }
};

// Platform-specific hover styles for dark footer context
const getFooterHoverClass = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return 'hover:bg-gradient-to-tr hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white hover:border-transparent hover:shadow-pink-500/25';
    case 'linkedin':
      return 'hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-blue-500/25';
    case 'whatsapp':
      return 'hover:bg-green-500 hover:text-white hover:border-transparent hover:shadow-green-500/25';
    case 'facebook':
      return 'hover:bg-blue-700 hover:text-white hover:border-transparent hover:shadow-blue-600/25';
    case 'youtube':
      return 'hover:bg-red-600 hover:text-white hover:border-transparent hover:shadow-red-500/25';
    case 'twitter':
      return 'hover:bg-white hover:text-black hover:border-transparent hover:shadow-white/25';
    case 'tiktok':
      return 'hover:bg-white hover:text-black hover:border-transparent hover:shadow-white/25';
    case 'pinterest':
      return 'hover:bg-red-700 hover:text-white hover:border-transparent hover:shadow-red-600/25';
    case 'telegram':
      return 'hover:bg-sky-500 hover:text-white hover:border-transparent hover:shadow-sky-400/25';
    default:
      return 'hover:bg-white hover:text-black hover:border-transparent hover:shadow-white/25';
  }
};

// Helper to normalize URL with protocol
const normalizeUrl = (url: string, platform: string): string => {
  if (!url || url.trim() === '') return '#';

  // Special WhatsApp handling
  if (platform === 'whatsapp') {
    const cleanNumber = url.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.');
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

interface SocialLinksProps {
  links: SocialLink[];
  iconSize?: string; // Tailwind class for icon size, e.g. 'w-5 h-5'
}

/**
 * SocialLinks — Reusable component for rendering social media icon buttons.
 * Designed for the dark footer context with hover glow effects.
 * Data source: `siteContent.office.socialLinks` from the admin panel.
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({ links, iconSize = 'w-5 h-5' }) => {
  if (!links || links.length === 0) {
    return (
      <p className="text-gray-600 text-sm italic">Nenhuma rede social configurada.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={normalizeUrl(link.url, link.platform)}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
          aria-label={link.label || link.platform}
          className={`
            w-10 h-10 flex items-center justify-center
            rounded-full border border-gray-700
            text-gray-400
            transition-all duration-300
            hover:scale-110 hover:shadow-lg
            active:scale-95
            ${getFooterHoverClass(link.platform)}
          `}
        >
          {getSocialIcon(link.platform, iconSize)}
        </a>
      ))}
    </div>
  );
};
