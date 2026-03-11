import "@/styles/globals.css";
import { Paddle } from '@paddle/paddle-js';

// Initialize Paddle on app startup
let paddleInstance = null;

if (typeof window !== 'undefined') {
  Paddle.initialize({
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production',
  }).then((paddle) => {
    paddleInstance = paddle;
    window.Paddle = paddle;
  }).catch((error) => {
    console.error('Error initializing Paddle:', error);
  });
}

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
