import React, { Component } from 'react';
import UserEntry from './UserEntry';
import map from 'lodash';
import $ from 'jquery';
import Tinycon from 'tinycon';

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
    this.updateUsers();
  }

  componentDidMount() {
    setInterval(this.updateUsers.bind(this), 60 * 1000);
  }

  updateUsers() {
    var self = this;
    $.getJSON('/api/user', (data) => {
      var num_online = 0;
      var users = data.objects.map((u) => {
        if(u.online) {
          num_online++;
        }
        return {
          name: u.name,
          lastSeen: u.last_seen,
          online: u.online
        };
      });
      Tinycon.setBubble(num_online);
      this.setState({
        users: users
      });
    });
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