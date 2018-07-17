import React from "react";
import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
import tippy from 'tippy.js'
import _ from "underscore";

cytoscape.use( popper );

class GraphContainer extends React.Component{
  constructor(props){
    super(props);
    this.build = this.build.bind(this);
    this.clean = this.clean.bind(this);
  }

  build() {

    console.log("Cytoscape.js is rendering the graph...");

    var cy = cytoscape(
      {
        container: document.getElementById("cy"),

        boxSelectionEnabled: false,
        autounselectify: true,

        minZoom: 0.1,
        maxZoom: 10,

        elements: this.props.elements,

        style: cytoscape.stylesheet()
          .selector("node")
          .css({
            "height": 80,
            "width": 80,
            "background-fit": "cover",
            "border-color": "#666",
            "font-size": "14px",
            "border-width": 3,
            "border-opacity": 0.5,
            "text-valign": "center",
            "label": "data(id)"
          })
          .selector("edge")
          .css({
            "width": 6,
            "target-arrow-shape": "triangle",
            "line-color": "#ffaaaa",
            "target-arrow-color": "#ffaaaa",
            "curve-style": "bezier",
            "label": "data(label)"
          }) 
          .selector(".autorotate")
          .css({
            "edge-text-rotation": "autorotate"
          }),

        layout: {
          name: "cose"
        }
      });

    var formatData = function(obj, indent) {
      var result = "";
      if (indent == null) {
        indent = "";
      }

      if (_.isEmpty(obj)) {
        return "Graph element has no properties"
      }

      for (var property in obj) {
        var value = obj[property];
        if (typeof value == 'string') {
          value = "'" + value + "'";
        } else if (typeof value == 'object') {
          if (value instanceof Array) {
            if (value.length > 0) {
              if (typeof value[0] != 'string') {
                value = formatData(value[0], indent + "  ");
                value = "{\n" + value + "\n" + indent + "}";
              }
            }
            // Just let JS convert the Array to a string!
            value = "[ " + value + " ]";
          } else {
            var od = formatData(value, indent + "  ");
            value = "{\n" + od + "\n" + indent + "}";
          }
        }
        result += indent + "'" + property + "': " + value + ",\n";
      }
      return result.replace(/,\n$/, "");
    }

    var schemaTooltip = function(node, text){
			return tippy.one( node.popperRef(), {
				html: (function(){
					var div = document.createElement('div');
          div.id = node.id() + "-schema-tip";
          div.style = "text-align: left;";
					div.innerHTML = "<pre>"+text+"</pre>";
					return div;
				})(),
				trigger: 'manual',
				placement: 'bottom',
				arrow: true,
				hideOnClick: false,
				multiple: true,
				sticky: true,
				flip: false,
				appendTo: document.getElementById("graphContainer"),
				popperOptions: {}
			});
		};

    var tooltips = {};
    if (this.props.schema && 
        this.props.schema.vertices && 
        this.props.schema.vertices.length) {
      this.props.schema.vertices.map(function(x){        
        var v = cy.getElementById(x["label"]);
        tooltips[v.id()] = schemaTooltip(v, formatData(x["data"]));
        v.on('tap', function(event) { 
          if (tooltips[event.target.id()].state.visible) { 
            tooltips[event.target.id()].hide();
          } else {
            tooltips[event.target.id()].show()
          }
        });
      });
    }

    if (this.props.schema && 
        this.props.schema.edges && 
        this.props.schema.edges.length) {
      this.props.schema.edges.map(function(x){        
        var v = cy.getElementById(x["label"] + x["from"] + x["to"]);
        tooltips[v.id()] = schemaTooltip(v, formatData(x["data"]));
        v.on('tap', function(event) { 
          if (tooltips[event.target.id()].state.visible) { 
            tooltips[event.target.id()].hide();
          } else {
            tooltips[event.target.id()].show()
          }
        });
      });
    }

		this.cy = cy;
		this.tooltips = tooltips;
  }

  clean() {
		if (this.tooltips) {
			for (var tip in this.tooltips) {
				this.tooltips[tip].hide();
				this.tooltips[tip].destroy();
			}
		}
		if (this.cy) {
			this.cy.destroy();
		}
	}

  componentDidMount() {
    this.build();
  }

  componentDidUpdate() {
  	this.clean();
  	this.build();
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props.elements, nextProps.elements) || 
      !_.isEqual(this.props.schema, nextProps.schema)
  }

  render() {
    let cyStyle = {
      height: "500px",
      width: "85%",
      margin: "5px auto",
      borderStyle: "solid",
      borderColor: "#D3D3D3",
      borderWidth: "thin"
    };
    return(
      <div style={cyStyle} id="cy"/>
    )
  }
}

export default GraphContainer;
