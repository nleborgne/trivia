import React from 'react';

class Clock extends React.Component {

  render() {
    return (
      <div>
        <h3 className="text-light">Time : {this.props.time}</h3>
      </div>
    )
  }
}

export default Clock;
