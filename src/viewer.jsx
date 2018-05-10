
import React from "react";
import ReactDOM from "react-dom";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
     alert('An essay was submitted: ' + this.state.value);
     event.preventDefault();
   }

  render() {
    const data = [{
      name: 'Tanner Linsley',
      age: 26,
      friend: {
        name: 'Jason Maurer',
        age: 23,
      }
    }]
    const columns = [{
      Header: 'Name',
      accessor: 'name' // String-based value accessors!
    }, {
      Header: 'Age',
      accessor: 'age',
      Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
    }, {
      id: 'friendName', // Required because our accessor is not a string
      Header: 'Friend Name',
      accessor: d => d.friend.name // Custom value accessors!
    }, {
      Header: props => <span>Friend Age</span>, // Custom header components!
      accessor: 'friend.age'
    }]


    return (
        <div>
        <label>Query</label>
        <div>
          <textarea rows="8" cols="50"/>
        </div>
        <input type="submit" value="Submit" />
        <ReactTable
           data={data}
           columns={columns}
         />
        </div>
    );
  }
}


ReactDOM.render(
  <Viewer/>,
  document.getElementById('app')
);
