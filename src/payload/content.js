class ContentTrait {
  get() {
    return this.content || '';
  }

  has() {
    return typeof this.content !== 'undefined'
  }

  remove() {
    delete this.content;
    return this;
  }

  set(content) {
    this.content = content;
    return this;
  }
}

module.exports = (req, res) => {
  if (res.hasOwnProperty('content')) {
    return;
  }

  Object.defineProperty(res, 'content', {
    writable: false,
    value: new ContentTrait
  });
};
