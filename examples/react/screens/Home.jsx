const React = require('react');

class Home extends React.Component {
  render() {
    return (<h1>{this.props.title}</h1>);
  }
}

module.exports = Home;
