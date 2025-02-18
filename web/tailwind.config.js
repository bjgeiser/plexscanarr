/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './app/**/*.{js,ts,jsx,tsx}'];
export const theme = {
  extend: {},
};
export const plugins = [require('@tailwindcss/typography'), require('daisyui')];
