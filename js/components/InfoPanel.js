import React from 'react'
import D3Histogram from '../d3/D3Histogram'

class InfoPanel extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidUpdate(prevProps) {
    }

    render() {
        var notFound = this.props.networkState.not_found.map((name, i) => <div key={i}>{name}</div>)
        var traits = this.props.networkState.traits.map((name, i) => <div style={{padding: '5px 0'}} key={i}>{name}</div>)
        return (
            <div>
            {this.props.networkState.genes.length > 1 ?
                <div>{this.props.networkState.genes.length} genes in network</div> :
                null
            }
            {notFound.length > 1 ?
                <div>{notFound.length} genes not available</div> :
                null
            }
            {traits.length > 1 ?
                <div>
                <div>{traits.length} traits</div>
                {traits}
                </div> :
                null
            }
            </div>
        )
    }
}

export default InfoPanel
