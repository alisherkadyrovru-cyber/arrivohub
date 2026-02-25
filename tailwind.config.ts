import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { boxShadow: { glass: "0 10px 40px rgba(0,0,0,0.22)" } } },
  plugins: [],
} satisfies Config;
