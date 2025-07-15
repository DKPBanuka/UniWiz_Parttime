/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New custom color palette based on the provided image
        'primary-dark': '#211C84',
        'primary-main': '#4D55CC',
        'primary-light': '#89CDFE',
        'primary-lighter': '#9e9fefff',
        // Existing custom colors, mapped to new palette or kept if general
        // Mapping old colors to new ones for consistency
        'dark-blue-text': '#211C84', // Formerly #2D336B
        'app-blue': '#4D55CC',     // Formerly #7886C7
        'app-light-blue': '#7A73D1', // Formerly #A9B5DF
        'app-bg-light': '#9eadefff',   // Formerly #E8EAF6
        // Keeping these as they are general background colors
        'bg-student-dashboard': '#FFF2F2',
        'bg-publisher-dashboard': '#F4F7FC',
      },
    },
  },
  plugins: [],
}
