
import ReactDOM from "react-dom";
import React from "react";

class HelloMessage extends React.Component {
  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

const app = document.createElement('div')

document.querySelector('body').appendChild(app)


ReactDOM.render(<HelloMessage name="Jane" />, app);