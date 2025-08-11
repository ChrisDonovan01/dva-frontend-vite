/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (renamed for clarity)
        primary: '#18365E',           // Adaptive Blue
        accent: '#FF6E4C',            // Interactive Orange
        secondary: '#F4F7FA',         // Light background
        lightgray: '#E6ECF2',         // Lighter card/section backgrounds
        sidebar: '#11243F',           // Darker variant for sidebar
        textPrimary: '#1B1F2B',       // Heading text
        textSecondary: '#4B5563',     // Body text
        success: '#3CB371',           // For good metrics
        warning: '#E85A4F',           // For alerts or poor metrics

        // Legacy support (optional – or rename to above)
        'sidebar-bg': '#20315A',      // Could map to sidebar or be deprecated
        'main-bg': '#ffffff',
        'header-text': '#324158',
        'dva-blue': '#18365E',        // DVA brand blue color
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
