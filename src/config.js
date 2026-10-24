// Empty destinations are hidden. Replace temporary PDF images with originals here.
export const config = {
  email: 'mohamed.walaa.zain@gmail.com',
  github: 'https://github.com/midowalaa099-commits',
  linkedin: 'https://www.linkedin.com/in/mohamedwalaadev/',
  whatsapp: '', // Optional contact link.
  cvFile: '/My-Portfolio/downloads/cv.pdf',
  portfolioFile: '/My-Portfolio/downloads/portfolio.pdf', // e.g. /Mohamed-Walaa-Zain-CV.pdf, placed in public/
  siteUrl: 'https://midowalaa099-commits.github.io/My-Portfolio', // Your public origin after deployment, without trailing slash.
  ogImage: '/My-Portfolio/images/og-placeholder.png',
  logo: '/My-Portfolio/assets/favicon.svg',
  portrait: '/My-Portfolio/assets/hero-portrait-700.webp',
  portraitSet: '/My-Portfolio/assets/hero-portrait-400.webp 400w, /My-Portfolio/assets/hero-portrait-700.webp 700w, /My-Portfolio/assets/hero-portrait.webp 1122w',
  aboutPortrait: '/My-Portfolio/assets/about-portrait-700.webp',
  aboutPortraitSet: '/My-Portfolio/assets/about-portrait-400.webp 400w, /My-Portfolio/assets/about-portrait-700.webp 700w, /My-Portfolio/assets/about-portrait.webp 1122w',
  learningSource: 'https://laracasts.com',
  projects: {
    masr: { slug: 'masr-security', image: '/My-Portfolio/images/masr-storefront.webp', srcSet: '/My-Portfolio/images/masr-400.webp 400w, /My-Portfolio/images/masr-800.webp 800w, /My-Portfolio/images/masr-storefront.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 904, live: 'https://masr-security.vercel.app', source: 'https://github.com/midowalaa099-commits/Masr-Security' },
    bank: { slug: 'mvp-bank', source: '', image: '/My-Portfolio/assets/bank-signin-screen.webp', srcSet: '/My-Portfolio/images/bank-400.webp 400w, /My-Portfolio/images/bank-800.webp 800w, /My-Portfolio/assets/bank-signin-screen.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 900, live: 'https://mvp-bank-lol-0f48.vercel.app' },
    order: { slug: 'order-app', live: 'https://order-app-frontend-one.vercel.app', image: '/My-Portfolio/assets/order-signin-screen.webp', srcSet: '/My-Portfolio/images/order-400.webp 400w, /My-Portfolio/images/order-800.webp 800w, /My-Portfolio/assets/order-signin-screen.webp 1440w', sizes: '(max-width: 560px) calc(100vw - 42px), (max-width: 800px) calc(100vw - 98px), (max-width: 1336px) 47vw, 675px', width: 1440, height: 900, source: 'https://github.com/midowalaa099-commits/Order-App' },
    batman: { slug: 'batman-cave-ideas', live: 'https://batman-cave-ideas.vercel.app', image: '', source: 'https://github.com/midowalaa099-commits/Batman-Cave-ideas' },
  },
};
