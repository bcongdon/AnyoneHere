import React, { Component } from 'react';
import Collapse from 'rc-collapse';
const Panel = Collapse.Panel;
import UserEntry from './UserEntry';
import UserChart from './UserChart';
import map from 'lodash';
import $ from 'jquery';
import Tinycon from 'tinycon';
require('rc-collapse/assets/index.css');


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

  getUsers() {
    return this.state.users.map((user, idx) => {
      var header = (
        <UserEntry name={user.name} lastSeen={user.lastSeen} online={user.online} key={idx}/>
      );
      return (
        <Panel header={header} showArrow={false} key={idx+1}>
          <UserChart />
        </Panel>
      );
    });
  }

  render() {
    return (
      <Collapse accordion={true} destroyInactivePanel={true}>
        {this.getUsers()}
      </Collapse>
    );
  }
}

export default UserTable;