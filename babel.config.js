export const presets = ['@babel/preset-env']
export const env = {
  test: {
    presets: ['@babel/preset-env'],
    plugins: ['transform-es2015-modules-commonjs'],
  },
}
