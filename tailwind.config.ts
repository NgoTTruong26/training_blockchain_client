import { nextui } from "@nextui-org/react"
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        default: "2560px",
      },
      padding: {
        default: "64px",
      },
      margin: {
        default: "64px",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
export default config
