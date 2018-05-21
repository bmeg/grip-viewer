
import React from "react";

import cytoscape from 'cytoscape';

import {connect} from 'react-redux';

class GraphContainer extends React.Component{
    constructor(props){
        super(props);
        this.build = this.build.bind(this);
        this.clean = this.clean.bind(this);
    }

    build(){

        console.log('* Cytoscape.js is rendering the graph..');

        this.cy = cytoscape(
        {
            container: document.getElementById('cy'),

            boxSelectionEnabled: false,
            autounselectify: true,

            style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'height': 80,
                    'width': 80,
                    'background-fit': 'cover',
                    'border-color': '#666',
                    "font-size": "14px",
                    'border-width': 3,
                    'border-opacity': 0.5,
                    'content': 'data(id)',
                    'text-valign': 'center',
                    'label': 'data(id)'
                })
                .selector('edge')
                .css({
                    'width': 6,
                    'target-arrow-shape': 'triangle',
                    'line-color': '#ffaaaa',
                    'target-arrow-color': '#ffaaaa',
                    'curve-style': 'bezier'
                })
                ,
            elements: this.props.elements,

            layout: {
                name: 'cose',
                directed: true,
                padding: 10
            }
            });
    }

  clean() {
		if (this.cy) {
			this.cy.destroy();
		}
	}

  componentDidMount(){
      this.build();
  }


  componentDidUpdate() {
  		this.clean();
  		this.build();
  }


  render(){
        let cyStyle = {
          height: '100%',
          width: '100%',
          margin: '20px 0px'
        };
        return(
            <div className="node_selected">
                <div style={cyStyle} id="cy"/>
            </div>
        )
    }
}


//function mapStateToProps(state){
//    return {"elements" : state.elements};
//}

//export default connect(mapStateToProps,null)(GraphContainer);

export default GraphContainer;
