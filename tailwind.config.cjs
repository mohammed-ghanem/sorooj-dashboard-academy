/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",      // app router
      "./pages/**/*.{js,ts,jsx,tsx}",    // pages router (if used)
      "./components/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
      // add any classes you build dynamically or that tailwind might miss
      "animate-pulse",
      "bg-gray-700",
      "bg-gray-600",
      "w-5", "h-4","w-8","h-8",
      "rounded-full","rounded-md",
      "ltr:right-3","rtl:left-3",
      "bkMainColor","backgroundDarkPurple","mainColor","hover-mainColor","scoundColor"
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  