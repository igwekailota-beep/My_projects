module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./src/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--primary-blue), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--primary-blue), var(${opacityVariable}))`;
          }
          return 'rgb(var(--primary-blue))';
        },
        'gradient-start': 'var(--gradient-start)',
        'gradient-end': 'var(--gradient-end)',
        'success': ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--success), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--success), var(${opacityVariable}))`;
          }
          return 'rgb(var(--success))';
        },
        'warning': ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--warning), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--warning), var(${opacityVariable}))`;
          }
          return 'rgb(var(--warning))';
        },
        'error': ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--error), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--error), var(${opacityVariable}))`;
          }
          return 'rgb(var(--error))';
        },
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
