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

        minZoom: 0.5,
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
            "content": "data(id)",
            "text-valign": "center",
            "label": "data(id)"
          })
          .selector("edge")
          .css({
            "width": 6,
            "target-arrow-shape": "triangle",
            "line-color": "#ffaaaa",
            "target-arrow-color": "#ffaaaa",
            "curve-style": "bezier"
          })
        ,
        layout: {
          name: "cose",
          directed: true,
          padding: 10
        }
      });

    var schemaTooltip = function(node, text){
			return tippy( node.popperRef(), {
				html: (function(){
					var div = document.createElement('div');
          div.id = node.id() + "-schema-tip";
					div.innerHTML = text;
					return div;
				})(),
				trigger: 'manual',
				placement: 'bottom',
				arrow: true,
				hideOnClick: false,
				multiple: true,
				sticky: true
			} ).tooltips[0];
		};

    var tooltips = {};
    if (this.props.schema && 
        this.props.schema.vertices && 
        this.props.schema.vertices.length) {
      this.props.schema.vertices.map(function(x){        
        var v = cy.getElementById(x["label"]);
        tooltips[v.id()] = schemaTooltip(v, JSON.stringify(x["data"], null, "\t"));
        v.on('tap', function(event) { 
          if (tooltips[event.target.id()].state.visible) { 
            tooltips[event.target.id()].hide();
          } else {
            tooltips[event.target.id()].show()
          }
        });
      });
    }
  }

  clean() {
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
      height: "100%",
      width: "100%",
      margin: "20px 0px"
    };
    return(
      <div className="node_selected">
        <div style={cyStyle} id="cy"/>
      </div>
    )
  }
}

export default GraphContainer;
