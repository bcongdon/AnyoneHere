import React, { Component } from 'react'
import Collapse from 'rc-collapse'
import UserEntry from './UserEntry'
import UserChart from './UserChart'
import { groupBy } from 'lodash'
import $ from 'jquery'
import Tinycon from 'tinycon'
import Loader from 'halogen/ClipLoader'

const Panel = Collapse.Panel
require('rc-collapse/assets/index.css')

class UserTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      measurements: {},
      measurementsLoaded: false
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
        measurements: measurements,
        measurementsLoaded: true
      })
    })
  }

  getUsers() {
    return this.state.users.map((user, idx) => {
      var header = (
        <UserEntry name={user.name} lastSeen={user.lastSeen} online={user.online} key={idx} />
      )

      var userChart = (<UserChart measurements={this.state.measurements[user.id] || []} />)

      if (!this.state.measurementsLoaded) {
        userChart = (<Loader color='#000000' size='48px' margin='24px' />)
      }

      return (
        <Panel header={header} showArrow={false} key={idx + 1} >
          {userChart}
        </Panel>
      )
    })
  }

  render() {
    return (
      <Collapse accordion>
        {this.getUsers()}
      </Collapse>
    )
  }
}

export default UserTable
