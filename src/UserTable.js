import React, { Component } from 'react'
import Collapse from 'rc-collapse'
import UserEntry from './UserEntry'
import UserChart from './UserChart'
import { groupBy } from 'lodash'
import $ from 'jquery'
import Tinycon from 'tinycon'
const Panel = Collapse.Panel
require('rc-collapse/assets/index.css')

class UserTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      measurements: {}
    }
    this.updateUsers()
    this.updateMeasurements()
  }

  componentDidMount() {
    setInterval(this.updateUsers.bind(this), 60 * 1000)
  }

  updateUsers() {
    $.getJSON('/api/user', (data) => {
      var numOnline = 0
      var users = data.users.map((u) => {
        if (u.online) {
          numOnline++
        }
        return {
          name: u.name,
          lastSeen: u.last_seen,
          online: u.online,
          id: u.id
        }
      })
      Tinycon.setBubble(numOnline)
      this.setState({
        users: users
      })
    })
  }

  updateMeasurements() {
    $.getJSON('/api/measurement', (data) => {
      var measurements = groupBy(data.measurements, 'user_id')
      this.setState({
        measurements: measurements
      })
    })
  }

  getUsers() {
    return this.state.users.map((user, idx) => {
      var header = (
        <UserEntry name={user.name} lastSeen={user.lastSeen} online={user.online} key={idx} />
      )
      return (
        <Panel header={header} showArrow={false} key={idx + 1} >
          <UserChart measurements={this.state.measurements[user.id] || []} />
        </Panel>
      )
    })
  }

  render() {
    return (
      <Collapse accordion destroyInactivePanel>
        {this.getUsers()}
      </Collapse>
    )
  }
}

export default UserTable
