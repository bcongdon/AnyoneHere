import React, { Component } from 'react';

class UserEntry extends Component {
  getStatus() {
    if(this.props.online) {
      return (
        <span className="glyphicon glyphicon-ok" style={{color: 'green'}}></span>
      )
    }
    else return (
      <span className="glyphicon glyphicon-remove" style={{color: 'red'}}></span>
    )
  }

  render() {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.getStatus()}</td>
        <td>{this.props.lastSeen}</td>
      </tr>
    );
  }
}

export default UserEntry;