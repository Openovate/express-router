const { Registry } = require('@openovate/jsm');

module.exports = (req, res) => {
  if (res.hasOwnProperty('rest')) {
    return;
  }

  Object.defineProperty(res, 'rest', {
    writable: false,
    value: new Registry
  });
};
