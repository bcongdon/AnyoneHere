import React, { Component } from 'react';
import UserTable from './UserTable'

class App extends Component {
  render() {
    return (
      <div className="App-container container-fluid">
        <div className="App-header">
          <h1>Anyone Here? 👀</h1>
        </div>
        <UserTable />
      </div>
    );
  }
}

export default App;
