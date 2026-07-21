/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crown: {
          gold: "#FFD700",
          amber: "#FFBF00",
          honey: "#FFC125",
          butter: "#FFE135",
        },
        obsidian: {
          900: "#0A0A0A",
          800: "#141414",
          700: "#1F1F1F",
          600: "#2A2A2A",
          500: "#3D3D3D",
        },
        tajin: {
          red: "#C41E3A",
          lime: "#A4C639",
          chili: "#E23D28",
        },
      },
      fontFamily: {
        pixel: ["VT323", "monospace"],
        code: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px rgba(0,0,0,1)",
        "pixel-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
        golden: "0 0 20px rgba(255,215,0,0.3)",
        crown: "0 4px 20px rgba(255,191,0,0.4)",
      },
    },
  },
  plugins: [],
};
