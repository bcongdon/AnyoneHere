import React, { Component } from 'react';
import moment from 'moment';

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

  getLastSeen() {
    if(!this.props.lastSeen) {
      return "Unknown";
    }
    return moment(this.props.lastSeen).fromNow();
  }

  render() {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.getStatus()}</td>
        <td>{this.getLastSeen()}</td>
      </tr>
    );
  }
}

export default UserEntry;