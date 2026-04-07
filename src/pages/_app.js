import "@/styles/globals.css";
import { ProvideUser } from "@/contexts/UserContext";
import { Analytics } from "@vercel/analytics/react";

// Initialize Paddle on app startup
if (typeof window !== 'undefined') {
  // Load Paddle.js SDK
  const script = document.createElement('script');
  script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  script.async = true;

  script.onload = () => {
    // Paddle is loaded, we'll initialize it when needed
    console.log('Paddle.js loaded');
  };

  script.onerror = () => {
    console.error('Failed to load Paddle.js');
  };

  document.head.appendChild(script);
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ProvideUser>
      <Component {...pageProps} />
      <Analytics />
    </ProvideUser>
  );
}
