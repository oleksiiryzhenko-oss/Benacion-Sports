// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable custom obfuscating transformer for production
if (process.env.NODE_ENV === 'production') {
  console.log('');
  console.log('🔐 [Metro] Obfuscating transformer ENABLED');
  console.log('');

  config.transformer.babelTransformerPath = path.resolve(__dirname, 'obfuscatingTransformer.js');
}

module.exports = config;
