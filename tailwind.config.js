/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brn: {
          dark: "#3C6410",
          mid: "#5E9918",
          light: "#8BC53F",
          pale: "#EEF5E4",
          ink: "#14180F"
        }
      }
    }
  },
  plugins: []
};
