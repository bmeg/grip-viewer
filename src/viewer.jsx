
import React from "react";
import ReactDOM from "react-dom";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import GraphContainer from "./graph-overview.jsx"
import O from "./aql.js";
import { createStore } from "redux";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        query: '',
        result:[],
        graph: 'bmeg',
        schema: {
          nodes: [
             { data: { id: 'Individual' } },
             { data: { id: 'Biosample' } },
             { data: { id: 'GeneExpression' } }
          ],
          edges: [
             { data: { source: 'Individual', target: 'Biosample' } },
             { data: { source: 'Biosample', target: 'GeneExpression' } }
          ]
        }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.schemaQuery = this.schemaQuery.bind(this);

    this.schemaQuery()
  }

  schemaQuery() {
    fetch( "/v1/graph/" + this.state.graph + "-schema/query", {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify( {query:[{"v":[]},{"where":{"condition": {"key": "_label", "value": "Object", "condition": "EQ"}}}]} ),
    }).then(function(response) {
      return response.text()
    }).then(function(text) {
      var lines = text.replace(/^\s+|\s+$/g, '').split("\n")
      var nodes = lines.map(JSON.parse).map(function(x){
        return {"data": {"id": x["vertex"]["gid"]}}
      }).filter( (x) => x.data.id != "root" )
      return nodes;
    }).then(function(nodes){
      fetch( "/v1/graph/" + this.state.graph + "-schema/query", {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify( {query:[{"e":[]},{"where":{"condition": {"key": "_label", "value": "field", "condition": "EQ"}}}]} ),
      }).then(function(response) {
        return response.text()
      }).then(function(text){
        var lines = text.replace(/^\s+|\s+$/g, '').split("\n")
        var edges = lines.map(JSON.parse).map(function(x){
          return {"data": {"source": x["edge"]["from"], "target":x["edge"]["to"]}}
        }).filter( (x) => x.data.source != "root" )
        this.setState({schema: {"nodes" : nodes, "edges":edges}});
      }.bind(this))
    }.bind(this))
  }

  handleSubmit(event) {
    //Hey, lets eval a bare string from the user, thats a really smart thing
    //to do. Try using https://github.com/nx-js/compiler-util
     var o = eval(this.state.query)
     fetch( "/v1/graph/" + this.state.graph + "/query", {
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
   }

   //Capture shift-return for submit
   handleKeyPress(e) {
     if (e.nativeEvent.keyCode === 13) {
       if(e.nativeEvent.shiftKey){
          this.handleSubmit()
       }
     }
   }

  //Capture the query as they type
  handleChange(event) {
    this.setState({query: event.target.value});
  }

  render() {
    let textStyle = {width: "55%", height: "250px", "float":"left"}
    let graphStyle = {width: "45%", height: "500px", "float":"right"}
    return (
        <div>
        <label>Query</label>
        <div>
          <textarea style={textStyle} value={this.state.value} onChange={this.handleChange} onKeyUp={this.handleKeyPress}/>
          <div style={graphStyle}>
            <GraphContainer elements={this.state.schema}/>
          </div>
        </div>
        <button type="submit" value="Submit" onClick={this.handleSubmit}>Search</button>
        <div>{this.state.result}</div>
        </div>
    );
  }
}


ReactDOM.render(
  <Viewer/>,
  document.getElementById('app')
);

//const store = createStore(rootReducer);
//export default store;
