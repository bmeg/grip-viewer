
import React from "react";
import ReactDOM from "react-dom";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import O from "./aql.js";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {query: '', result:[]};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleSubmit(event) {
    //Hey, lets eval a bare string from the user, thats a really smart thing
    //to do
     var o = eval(this.state.query)

     fetch( "/v1/graph/example/query", {
       method: 'POST',
       headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
       body: JSON.stringify( {query:o.query} ),
     }).then(function(response) {
       return response.text()
     }).then(function(text) {
       var lines = text.replace(/^\s+|\s+$/g, '').split("\n")
       var parsed = lines.map(function(x, i){return <div key={i}>{x}</div>})
       this.setState({result: <div>{parsed}</div>});
     }.bind(this))

     event.preventDefault();
   }

   handleKeyPress(e) {
     if (e.nativeEvent.keyCode === 13) {
       if(e.nativeEvent.shiftKey){
          this.handleSubmit()
       }
     }
   }

  handleChange(event) {
    this.setState({query: event.target.value});
  }

  render() {
    return (
        <div>
        <label>Query</label>
        <div>
          <textarea rows="8" cols="150" value={this.state.value} onChange={this.handleChange} onKeyUp={this.handleKeyPress}/>
        </div>
        <button type="submit" value="Submit" onClick={this.handleSubmit}>
          Search
        </button>
        <div>{this.state.result}</div>
        </div>
    );
  }
}



ReactDOM.render(
  <Viewer/>,
  document.getElementById('app')
);
