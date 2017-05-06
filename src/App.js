import React, { Component } from 'react'
import UserTable from './UserTable'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className='App-container container-fluid'>
        <div className='App-header'>
          <h1>Anyone Here? 👀</h1>
        </div>
        <div className='panel panel-default'>
          <UserTable />
        </div>
      </div>
    )
  }
}

export default App
