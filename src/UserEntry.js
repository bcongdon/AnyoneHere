import React, { Component } from 'react'
import moment from 'moment'
import './UserEntry.css'

class UserEntry extends Component {
  getStatus() {
    if (this.props.online) {
      return (
        <span className='glyphicon glyphicon-ok' style={{color: 'green'}} />
      )
    } else {
      return (
        <span className='glyphicon glyphicon-remove' style={{color: 'red'}} />
      )
    }
  }

  getLastSeen() {
    if (!this.props.lastSeen) {
      return 'Unknown'
    }
    return moment.utc(this.props.lastSeen).local().fromNow()
  }

  render() {
    return (
      <div className='UserEntry'>
        <div className='UserEntry-status'>{this.getStatus()}</div>
        <div className='UserEntry-name'>{this.props.name}</div>
        <div className='UserEntry-last-seen'>{this.getLastSeen()}</div>
      </div>
    )
  }
}

export default UserEntry
