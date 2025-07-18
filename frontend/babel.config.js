module.exports = {
  presets: [
    'next/babel', // ← Next.js開発の場合はこれ1個でOK
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
