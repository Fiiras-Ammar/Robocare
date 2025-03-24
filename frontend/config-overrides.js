const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

function removeNodePrefix(request, resolveContext, callback, resolver) {
  if (request.request?.startsWith('node:')) {
    const newRequest = request.request.replace(/^node:/, '');
    const obj = { ...request, request: newRequest };
    return resolver.doResolve(
      resolver.hooks.resolve,
      obj,
      `Stripped node: prefix from ${request.request}`,
      resolveContext,
      callback
    );
  }
  callback();
}

module.exports = function override(config) {
  config.resolve.plugins = [
    {
      apply: (resolver) => {
        resolver.hooks.resolve.tapAsync(
          'RemoveNodePrefixPlugin',
          (request, context, cb) => removeNodePrefix(request, context, cb, resolver)
        );
      }
    },
    ...(config.resolve.plugins || [])
  ];

  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'), // Critical fix [[7]]
    url: require.resolve('url'),
    buffer: require.resolve('buffer'),
    querystring: require.resolve('querystring-es3'),
    zlib: require.resolve('browserify-zlib'),
    path: require.resolve('path-browserify'),
    net: false,
    tls: false,
    fs: false,
    child_process: false,
    http2: false,
  };

  config.resolve.alias = {};

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new NodePolyfillPlugin({
      excludeAliases: ['process', 'console'] // Prevent conflicts
    })
  ]);

  config.module.rules.push({
    test: /\.m?js/,
    resolve: { fullySpecified: false },
  });

  return config;
};