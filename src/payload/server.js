const { Registry } = require('@openovate/jsm');

module.exports = (req, res) => {
  if (req.hasOwnProperty('server')) {
    return;
  }

  Object.defineProperty(req, 'server', {
    writable: false,
    value: new Registry
  });

  //if the required is not set
  if (!req.headers || !req.headers.host || !req.url) {
    return;
  }

  let protocol = 'http';
  if (req.connection.encrypted) {
    protocol = 'https';
  }

  // Note: X-Forwarded-Proto is normally only ever a
  //       single value, but this is to be safe.
  const header = req.headers['x-forwarded-proto'] || protocol;

  if (header.indexOf(',') !== -1) {
    protocol = header.substring(0, header.indexOf(',')).trim();
  }

  protocol = header.trim();

  const url = new URL(protocol + '://' + req.headers.host + req.url);

  //LEGEND:
  // url.hash - #foo
  // url.host - 127.0.0.1:3000
  // url.hostname - 127.0.0.1
  // url.href - http://127.0.0.1:3000/some/path?lets=dothis
  // url.origin - http://127.0.0.1:3000
  // url.password - ??
  // url.pathname - /some/path
  // url.port - 3000
  // url.protocol - http:
  // url.search - ?lets=dothis

  let query = url.search;
  if (query.indexOf('?') === 0) {
    query = query.substr(1);
  }

  req.server.set({
    REDIRECT_STATUS: req.statusCode,
    HTTP_HOST: url.hostname,
    HTTP_USER_AGENT: req.headers['user-agent'] || null,
    HTTP_REFERER: req.headers['referer'] || null,
    HTTP_ACCEPT: req.headers['accept'] || '*',
    HTTP_ACCEPT_ENCODING: req.headers['accept-encoding'] || '*',
    HTTP_ACCEPT_CHARSET: req.headers['accept-charset'] || '*',
    HTTP_ACCEPT_LANGUAGE: req.headers['accept-language'] || '*',
    HTTP_COOKIE: req.headers['cookie'] || '',
    HTTPS: protocol === 'https',
    SERVER_NAME: url.hostname,
    //SERVER_ADDR: ??
    SERVER_PORT: url.port,
    //REMOTE_ADDR: ??
    //DOCUMENT_ROOT: ??
    REDIRECT_URL: req.url,
    SERVER_PROTOCOL: 'HTTP/' + req.httpVersion,
    REQUEST_METHOD: req.method.toUpperCase(),
    QUERY_STRING: query,
    REQUEST_URI: req.url,
    //REQUEST_TIME: ??,
    //SERVER_SIGNATURE: ??
  });
};
