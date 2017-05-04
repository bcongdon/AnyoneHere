import React, { Component } from 'react';
import UserEntry from './UserEntry';
import map from 'lodash';

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [{
        name: "foo",
        lastSeen: "bar",
        online: true
      }]
    }
  }

  getHeader() {
    return (
      <tr>
        <th>Name</th>
        <th>Online</th>
        <th>Last Seen</th>
      </tr>
    )
  }

  getUsers() {
    return this.state.users.map((user, idx) => {
      return (<UserEntry name={user.name} lastSeen={user.lastSeen} online={user.online} key={idx}/>)
    });
  }

  render() {
    return (
      <table className="table">
        <thead>{this.getHeader()}</thead>
        <tbody>{this.getUsers()}</tbody>
      </table>
    );
  }
}

export default UserTable;