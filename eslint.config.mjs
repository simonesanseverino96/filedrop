import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      '.claude/**',
      '.swarm/**',
      '.claude-flow/**',
      'Vaultransfer/**',
    ],
  },
]

export default config
