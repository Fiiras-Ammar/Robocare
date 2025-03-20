const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/api-external-sensor/',
    createProxyMiddleware({
      target: 'http://my.smartfarm.com.tn',
      changeOrigin: true,
    })
  );
};