const React = require('react');

class Product extends React.Component {
  render() {
    return (<h1>Product {this.props.id}</h1>);
  }
}

module.exports = Product;
