import React from "react";
import ReactDOM from "react-dom";
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import GraphContainer from "./graph-overview.jsx"
import O from "./aql.js";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      result:[],
      graph: "",
      graphs: [],
      schema: {
        vertices: [],
        edges: [],
      },
      elements: {
        nodes: [
          { data: { id: "Please Select a Graph" } }
        ],
        edges: []
      }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.schemaQuery = this.schemaQuery.bind(this);
    this.listGraphs = this.listGraphs.bind(this);

    this.listGraphs()
  }

  listGraphs() {
    console.log("listing graphs...")
    fetch( "/v1/graph", {
      method: "GET",
      credentials: "same-origin",
    }).then(function(response) {
      return response.text()
    }).then(function(text) {
      var lines = text.replace(/^\s+|\s+$/g, "").split("\n")
      var graphs = lines.map(JSON.parse).map(function(x) {
        return x["graph"]
      })
      console.log("found graphs:", graphs)
      this.setState({graphs: graphs})
    }.bind(this))
  }

  schemaQuery(graph) {
    console.log("querying schema for graph: ", graph)
    fetch( "/v1/graph/" + graph + "/schema", {
      method: "GET",
      credentials: "same-origin",
    }).then(function(response) {
      return response.json()
    }).then(function(json) {
      var edges = json["edges"].map(function(x){
        return {
          "data": {
            "id": x["label"] + x["from"] + x["to"], 
            "label": x["label"], 
            "source": x["from"], 
            "target": x["to"]
          }, 
          "classes": "autorotate"
        }
      })
      var nodes = json["vertices"].map(function(x){
        return {"data": {"id": x["label"]}}
      })
      this.setState({elements: {"nodes": nodes, "edges": edges}, schema: json})
    }.bind(this))
  }

  handleSubmit(event) {
    //Hey, lets eval a bare string from the user, thats a really smart thing
    //to do. Try using https://github.com/nx-js/compiler-util
    var q = eval(this.state.query)
    if (!q) {
      console.log("there is no query to submit")
      return
    }
    console.log("querying graph: ", q)
    fetch( "/v1/graph/" + this.state.graph + "/query", {
      method: "POST",
      credentials: "same-origin",
      headers: {"Content-Type": "application/json", "Accept": "application/json"},
      body: JSON.stringify( {query: q.query} ),
    }).then(function(response) {
      return response.text()
    }).then(function(text) {
      var lines = text.replace(/^\s+|\s+$/g, "").split("\n")
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

  //Capture the query as they type
  handleSelect(event) {
    console.log("selected graph:", event.target.value)
    this.setState({graph: event.target.value});
    this.schemaQuery(event.target.value);
  }

  render() {
    let textStyle = {width: "100%", height: "30px", fontSize: "16px", margin: "5px"}
    let selectStyle = {width: "15%", height: "35px", fontSize: "16px", margin: "5px"}
    let buttonStyle = {height: "35px", fontSize: "16px", margin: "5px"}
    let optionItems = this.state.graphs.map(
      (graph) => <option key={graph}>{graph}</option>
    )
    let graphStyle = {width: "100%", height: "500px", margin: "5px"}

    return (
      <div style={{margin: "2.5%"}}>
        <div style={graphStyle}>
          <GraphContainer elements={this.state.elements} schema={this.state.schema}/>
        </div>
        <div>
          <select style={selectStyle} value={this.state.graph} onChange={this.handleSelect}>
            <option value="" disabled>Select Graph</option>
            {optionItems}
          </select>
        </div>
        <div>
          <textarea style={textStyle} value={this.state.value} onChange={this.handleChange} onKeyUp={this.handleKeyPress} placeholder="O.query().V()..."/>
        </div>
        <div>
          <button style={buttonStyle} type="submit" value="Submit" onClick={this.handleSubmit}>Search</button>
        </div>
        <br/>
        <div>
          {this.state.result}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Viewer/>,
  document.getElementById("app")
);
