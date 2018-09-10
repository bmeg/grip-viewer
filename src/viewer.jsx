import React from "react";
import ReactDOM from "react-dom";

import ReactTable from "react-table";
import "react-table/react-table.css";

import GraphContainer from "./graph-overview.jsx";
import "./viewer.css";

const aql = `
function process(val) {
	if (!val) {
		val = []
  } else if (typeof val == "string" || typeof val == "number") {
	  val = [val]
  } else if (!Array.isArray(vall)) {
		throw "not something we know how to process into an array"
	}
	return val
}

function query() {
	return {
		query: [],
		V: function(id) {
			this.query.push({'v': process(id)})
			return this
		},
		E: function(id) {
			this.query.push({'e': process(id)})
			return this
		},
		out: function(label) {
			this.query.push({'out': process(label)})
			return this
		},
		in_: function(label) {
			this.query.push({'in': process(label)})
			return this
		},
		both: function(label) {
			this.query.push({'both': process(label)})
			return this
		},
		outEdge: function(label) {
			this.query.push({'out_edge': process(label)})
			return this
		},
		inEdge: function(label) {
			this.query.push({'in_edge': process(label)})
			return this
		},
		bothEdge: function(label) {
			this.query.push({'both_edge': process(label)})
			return this
		},
		mark: function(name) {
			this.query.push({'mark': name})
			return this
		},
		select: function(marks) {
			this.query.push({'select': {'marks': process(marks)}})
			return this
		},
		limit: function(n) {
			this.query.push({'limit': n})
			return this
		},
		offset: function(n) {
			this.query.push({'offset': n})
			return this
		},
		count: function() {
			this.query.push({'count': ''})
			return this
		},
		distinct: function(val) {
			this.query.push({'distinct': process(val)})
			return this
		},
		render: function(r) {
			this.query.push({'render': r})
			return this
		},
		where: function(expression) {
			this.query.push({'where': expression})
			return this
		},
		aggregate: function() {
			this.query.push({'aggregate': {'aggregations': Array.prototype.slice.call(arguments)}})
			return this
		}
	}
}

// Where operators
function and_() {
	return {'and': {'expressions': Array.prototype.slice.call(arguments)}}
}

function or_() {
	return {'or': {'expressions': Array.prototype.slice.call(arguments)}}
}

function not_(expression) {
	return {'not': expression}
}

function eq(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'EQ'}}
}

function neq(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'NEQ'}}
}

function gt(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'GT'}}
}

function gte(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'GTE'}}
}

function lt(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'LT'}}
}

function lte(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'LTE'}}
}

function in_(key, values) {
	return {'condition': {'key': key, 'value': process(values), 'condition': 'IN'}}
}

function contains(key, value) {
	return {'condition': {'key': key, 'value': value, 'condition': 'CONTAINS'}}
}

// Aggregation builders
function term(name, label, field, size) {
	agg = {
		"name": name,
		"term": {"label": label, "field": field}
	}
	if (size) {
		if (typeof size != "number") {
			throw "expected size to be a number"
		}
		agg["term"]["size"] = size
	}
	return agg
}

function percentile(name, label, field, percents) {
	if (!percents) {
		percents = [1, 5, 25, 50, 75, 95, 99]
	} else {
		percents = process(percents)
	} 

  if (!percents.every(function(x){ return typeof x == "number" })) {
		throw "percents expected to be an array of numbers"
	}

	return {
		"name": name,
		"percentile": {
			"label": label, "field": field, "percents": percents
		}
	}
}

function histogram(name, label, field, interval) {
	if (interval) {
		if (typeof interval != "number") {
			throw "expected interval to be a number"
		}
	}
	return {
		"name": name,
		"histogram": {
			"label": label, "field": field, "interval": interval
		}
	}
}

function V(id) {
  return query().V(id)
}

function E(id) {
  return query().E(id)
}
`

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      query: "",
      queryResult: [],
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
      if (!response.ok) {
        var err = "GET " + response.url + " " + response.status + " " + 
            response.statusText
        this.setState({error: err})
        throw err
      }
      return response.text()
    }.bind(this)).then(function(text) {
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
      if (!response.ok) {
        var err = "GET " + response.url + " " + response.status + " " + 
            response.statusText
        this.setState({error: err})
        throw err
      }
      return response.json()
    }.bind(this)).then(function(json) {
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
    var q = eval(aql + this.state.query)
    if (!q) {
      console.log("there is no query to submit")
      return
    }
    if (this.state.graph == "") {
      console.log("no graph was selected to query")
      return
    }
    console.log("querying graph:", this.state.graph, ":",  q)
    fetch( "/v1/graph/" + this.state.graph + "/query", {
      method: "POST",
      credentials: "same-origin",
      headers: {"Content-Type": "application/json", "Accept": "application/json"},
      body: JSON.stringify( {query: q.query} ),
    }).then(function(response) {
      if (!response.ok) {
        var err = "POST " + response.url + " " + response.status + " " + 
            response.statusText
        this.setState({error: err})
        throw err
      }
      return response.text()
    }.bind(this)).then(function(text) {
      var parsed = [];
      if (text) {
        var lines = text.replace(/^\s+|\s+$/g, "").split("\n")
        var parsed = lines.map(JSON.parse).map(function(x){ return {"result": JSON.stringify(x["result"])} });
      }
      this.setState({queryResult: parsed});
    }.bind(this))
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
    let selectStyle = {width: "15%", height: "2em", fontSize: "1.25em", margin: "5px 0px"}
    let optionItems = this.state.graphs.map(
      (graph) => <option key={graph}>{graph}</option>
    )
    let textStyle = {width: "100%", height: "2em", fontSize: "1.25em", margin: "5px 0px"}
    let buttonStyle = {height: "2em", fontSize: "1.25em", margin: "5px 0px"}

    return (
      <div id="appContainer" style={{margin: "2.5%"}}>

        <div id="graphContainer">
          <GraphContainer elements={this.state.elements} schema={this.state.schema}/>
        </div>

        <div id="errorMessage">
          <h4 style={{color: "red", textAlign: "center"}}>{this.state.error}</h4>
        </div>

        <div id="selectGraph">
          <select style={selectStyle} value={this.state.graph} onChange={this.handleSelect}>
            <option value="" disabled>Select Graph</option>
            {optionItems}
          </select>
        </div>

        <div id="queryTextBox">
          <textarea style={textStyle} value={this.state.value} onChange={this.handleChange} onKeyUp={this.handleKeyPress} placeholder="V().where(...)"/>
        </div>

        <div id="submitButton">
          <button style={buttonStyle} type="submit" value="Submit" onClick={this.handleSubmit}>Search</button>
        </div>

        <div id="resultsTable">
          <ReactTable
            data={this.state.queryResult}
            columns={[
              {
                Header: "Query Results",
                accessor: "result"
              }
            ]}
            noDataText={"No Results"}
            pageSizeOptions={[10, 25, 50, 100]}
            defaultPageSize={10}
            minRows={10}
            sortable={true}
            className={"-striped -highlight"}
          />
        </div>

      </div>
    );
  }
}

ReactDOM.render(
  <Viewer/>,
  document.getElementById("app")
);
