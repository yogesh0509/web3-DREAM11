/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        spc: ["Space Grotesk", "sans-serif"],
        proxima: ["Proxima", "sans-serif"],
        proxima_semibold: ["Proxima-SemiBold", "sans-serif"],
        proxima_bold: ["Proxima-Bold", "sans-serif"],
        recoleta: ["Recoleta", "sans-serif"],
        recoleta_bold: ["Recoleta-Bold", "sans-serif"],
        recoleta_black: ["Recoleta-Black", "sans-serif"],
        recoleta_semibold: ["Recoleta-SemiBold", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
