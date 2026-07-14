import { defineConfig } from 'vitepress'
import pkg from '../../package.json'

export default defineConfig({
  title: "React Native Incoming Call",
  description: "Android full-screen incoming call notification utility for React Native powered by Nitro Modules",
  base: '/react-native-incoming-call/', // Fits GitHub Pages deployment path
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      {
        text: `v${pkg.version}`,
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: 'https://github.com/t-kiattisak/react-native-incoming-call/blob/main/CONTRIBUTING.md' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/guide/getting-started' },
          { text: 'API Reference', link: '/guide/api-reference' }
        ]
      },
      {
        text: 'Core Guides',
        items: [
          { text: 'Custom RN UI', link: '/guide/custom-ui' },
          { text: 'Background Integration', link: '/guide/background-integration' }
        ]
      },
      {
        text: 'Resources & Help',
        items: [
          { text: 'Assets & Customization', link: '/guide/assets-customization' },
          { text: 'Troubleshooting & FAQ', link: '/guide/troubleshooting' },
          { text: 'Changelog', link: '/changelog' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/t-kiattisak/react-native-incoming-call' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/t-kiattisak/react-native-incoming-call/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Kiattisak Jomram'
    }
  }
})
