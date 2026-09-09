/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#1e3a8a',       // Primary Indian digital service deep navy
          navydark: '#0f172a',   // Header / dark navy
          navylight: '#3b82f6',  // Interactive blue
          saffron: '#ea580c',    // Subtle Indian saffron accent
          saffronlight: '#fed7aa',
          surface: '#f8fafc',    // Very light gray background
          surfacealt: '#f1f5f9',
          border: '#cbd5e1',     // Clear structural borders
          borderlight: '#e2e8f0',
          text: '#0f172a',       // Dark readable text
          textmuted: '#475569',
          success: '#059669',    // Verified green
          warning: '#d97706',    // Caution
          error: '#dc2626'       // Danger / emergency red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
