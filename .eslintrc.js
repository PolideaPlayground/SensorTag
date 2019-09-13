module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: [
    '@react-native-community',
    'plugin:prettier/recommended',
    'plugin:flowtype/recommended',
  ],
  plugins: ['flowtype'],
  rules: {
    'flowtype/space-after-type-colon': 0,
    'react-native/no-inline-styles': 0,
  },
};
