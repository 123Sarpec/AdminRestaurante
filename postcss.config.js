const { plugin } = require('postcss');
const tailwindcss = require('tailwindcss');

module.exports= {

    plugins: [
    tailwindcss('./tailwind.config.js'),
    require('autoprefixer')
    ]
}