///tech-reviews-app-react/babel.config.cjs

module.exports = {
    presets: [
      ['@babel/preset-env', {targets: {node: 'current'}}], // For modern JavaScript
      ['@babel/preset-react', {runtime: 'automatic'}]     // For JSX and new JSX transform
    ],
  };
  