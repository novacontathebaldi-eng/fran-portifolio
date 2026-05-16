/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                primary: 'var(--color-primary, #1a1a1a)',
                secondary: 'var(--color-secondary, #6b7280)',
                accent: 'var(--color-accent, #d4bbb0)',
                background: 'var(--color-background, #ffffff)',
                textColor: 'var(--color-text, #111827)',
            }
        }
    },
    plugins: [],
}
