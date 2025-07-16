/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superb modern color palette
        'primary-dark': '#1A202C', // Deep charcoal/navy for strong accents
        'primary-main': '#4F46E5', // Vibrant indigo for main actions
        'primary-light': '#818CF8', // Lighter indigo for secondary elements
        'primary-lighter': '#E0E7FF', // Very light blue for backgrounds/hovers
        
        'accent-green': '#10B981',   // Bright green for success/positive actions
        'accent-red': '#EF4444',     // Classic red for errors/destructive actions
        'accent-yellow': '#F59E0B',  // Warm yellow for warnings/highlights
        
        'neutral-dark': '#374151',   // Dark gray for primary text
        'neutral-medium': '#6B7280', // Medium gray for secondary text/borders
        'neutral-light': '#F9FAFB',  // Off-white for light backgrounds
        
        // Backgrounds for different dashboards (can be adjusted to fit new palette)
        'bg-student-dashboard': '#FDF2F8', // Soft pinkish-white
        'bg-publisher-dashboard': '#F0F4F8', // Light bluish-gray
      },
    },
  },
  plugins: [],
}
