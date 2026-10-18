// Set NEXT_PUBLIC_SITE_URL to the real domain when deploying (e.g. https://pyrotech.example.com).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pyrotech-landing.vercel.app').replace(/\/$/, '');
