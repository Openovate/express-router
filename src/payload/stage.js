const formidable = require('formidable');
const queryString = require('querystrings');
const { Registry } = require('@openovate/jsm');

function getPost(req) {
  if (!req.method || req.method.toLowerCase() !== 'post') {
    return;
  }

  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (error, fields, files) => {
      if (error) {
        return resolve({});
      }

      //clone
      fields = Object.assign({}, fields);
      files = Object.assign({}, files);

      const body = new Registry;

      Object.keys(fields).forEach(name => {
        //change path to dot notation
        const path = name
          .replace(/\]\[/g, '.')
          .replace('[', '.')
          .replace(/\[/g, '')
          .replace(/\]/g, '');

        //if the field value is not an array
        if (!Array.isArray(fields[name])) {
          //make it an array
          fields[name] = [fields[name]];
        }

        //now loop through each value
        fields[name].forEach(value => {
          //and set the value
          body.setDot(path, value);
        });
      });

      Object.keys(files).forEach(name => {
        //change path to dot notation
        const path = name
          .replace(/\]\[/g, '.')
          .replace('[', '.')
          .replace(/\[/g, '')
          .replace(/\]/g, '');

        //if the field value is not an array
        if (!Array.isArray(files[name])) {
          //make it an array
          files[name] = [files[name]];
        }

        //now loop through each value
        files[name].forEach(value => {
          //and set the value
          body.setDot(path, value);
        });
      });

      resolve(body.get());
    });
  });
}

function getQuery(req) {
  if (!req.url) {
    return;
  }

  const url = new URL('http://127.0.0.1' + req.url);

  let query = url.search;
  if (query.indexOf('?') === 0) {
    query = query.substr(1);
  }

  if (!query) {
    return {};
  }

  return queryString.parse(query);
}

module.exports = async (req, res) => {
  if (req.hasOwnProperty('stage')) {
    return;
  }

  Object.defineProperty(req, 'stage', {
    writable: false,
    value: new Registry
  });

  const query = getQuery(req);
  const post = await getPost(req)

  req.stage.set(Object.assign({}, query, post));
};
