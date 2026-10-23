// Empty destinations are hidden. Replace temporary PDF images with originals here.
export const config = {
  email: 'mohamed.walaa.zain@gmail.com',
  github: 'https://github.com/midowalaa099-commits',
  linkedin: 'https://www.linkedin.com/in/mohamed-walaa-721261204/',
  whatsapp: '', // Add a full https://wa.me/ URL with country code.
  cvFile: '/downloads/cv.pdf',
  cvDownloadName: 'Backend & Web Developer - Mohamed Walaa CV.pdf',
  portfolioDownloadName: 'Backend & Web Developer - Mohamed Walaa Portfolio.pdf',
  portfolioFile: '/downloads/portfolio.pdf', // e.g. /Mohamed-Walaa-Zain-CV.pdf, placed in public/
  siteUrl: 'https://midowalaa099-commits.github.io', // Your public origin after deployment, without trailing slash.
  ogImage: '/images/og-placeholder.png',
  logo: '/assets/favicon.svg',
  portrait: '/assets/hero-portrait-700.webp',
  portraitSet: '/assets/hero-portrait-400.webp 400w, /assets/hero-portrait-700.webp 700w, /assets/hero-portrait.webp 1122w',
  aboutPortrait: '/assets/about-portrait-700.webp',
  aboutPortraitSet: '/assets/about-portrait-400.webp 400w, /assets/about-portrait-700.webp 700w, /assets/about-portrait.webp 1122w',
  learningSource: 'https://laracasts.com',
  projects: {
    masr: { slug: 'masr-security', image: '/images/masr-storefront.webp', srcSet: '/images/masr-400.webp 400w, /images/masr-800.webp 800w, /images/masr-storefront.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 904, live: 'https://masr-security.vercel.app', source: 'https://github.com/midowalaa099-commits/Masr-Security' },
    bank: { slug: 'mvp-bank', source: 'https://github.com/midowalaa099-commits/mvp-bank', image: '/assets/bank-signin-screen.webp', srcSet: '/images/bank-400.webp 400w, /images/bank-800.webp 800w, /assets/bank-signin-screen.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 900, live: 'https://mvp-bank-lol-0f48.vercel.app' },
    order: { slug: 'order-app', live: 'https://order-app-frontend-one.vercel.app', image: '/assets/order-signin-screen.webp', srcSet: '/images/order-400.webp 400w, /images/order-800.webp 800w, /assets/order-signin-screen.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 900, source: 'https://github.com/midowalaa099-commits/Order-App' },
    batman: { slug: 'batman-cave-ideas', live: 'https://batman-cave-ideas.vercel.app', image: '', source: 'https://github.com/midowalaa099-commits/Batman-Cave-ideas' },
  },
};
