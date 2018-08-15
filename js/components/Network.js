import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import config from '../config'
import D3Network from '../d3/D3Network'
import D3Matrix from '../d3/D3Matrix'
import D3Histogram from '../d3/D3Histogram'
import { convertNetworkForD3, cluster } from '../util/funNetwork'

class Network extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: 'loading',
            genes: [],
            not_found: [],
            traits: [],
            network: null,
            d3network: null,
            d3matrix: null,
            selectedTab: 0,
            message: null
        }
        this.handleServerResponse = this.handleServerResponse.bind(this)
        this.handleNetworkMouseEnter = this.handleNetworkMouseEnter.bind(this)
        this.handleNetworkMouseLeave = this.handleNetworkMouseLeave.bind(this)
        this.loadNetwork = this.loadNetwork.bind(this)
        this.loadGWASGenes = this.loadGWASGenes.bind(this)
        this.onTabSelect = this.onTabSelect.bind(this)
        if (props.match.params.gwas) {
            this.loadGWASGenes(props.match.params.gwas, props.match.params.mlogp, props.match.params.exactTrait)
        } else if (props.match.params.query) {
            this.loadNetwork(props.match.params.query)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.params.query &&
            (this.props.match.params.query !== nextProps.match.params.query)) {
            this.setState({
                loading: 'loading'
            })
            this.loadNetwork(nextProps.match.params.query)
        } else if (nextProps.match.params.gwas &&
            (this.props.match.params.gwas !== nextProps.match.params.gwas) ||
            (this.props.match.params.mlogp !== nextProps.match.params.mlogp) ||
            (this.props.match.params.exactTrait !== nextProps.match.params.exactTrait)) {
            this.setState({
                loading: 'loading'
            })
            this.loadGWASGenes(nextProps.match.params.gwas, nextProps.match.params.mlogp, nextProps.match.params.exactTrait)
        }
    }

    handleServerResponse(result) {

        if (result.genes.length == 0) {
            return alert('no genes found! maybe you can try again?')
        }

        this.setState({
            genes: result.genes,
            not_found: result.not_found,
            traits: result.traits || [],
            network: null,
            d3network: null,
            d3matrix: null,
            message: null
        })
        if (result.network.length > 0) {
            this.setState({
                loading: 'clustering'
            })
            // how to do this nicely?
            // callback on setState does not work - although render sees the new state, the dom is not updated accordingly: weird
            setTimeout(() => {
                var network = convertNetworkForD3(result, config.network.links.threshold, false)
                if (network.elements.nodes.length > 5) {
                    cluster(result, network)
                }
                this.setState({
                    loading: false
                })
                setTimeout(() => {
                    document.getElementById('network').innerHTML = ''
                    document.getElementById('matrix').innerHTML = ''
                    if (this.state.selectedTab == 0) {
                        var d3network = new D3Network('network', network,
                        {mouseenter: this.handleNetworkMouseEnter, mouseleave: this.handleNetworkMouseLeave, mousemove: this.handleNetworkMouseMove})
                        this.setState({
                            network: network,
                            d3network: d3network
                        })
                    } else {
                        console.log(network)
                        if (network.elements.nodes.length > 500) {
                            this.setState({
                                network: network,
                                message: 'The matrix is only shown for less than 500 genes'
                            })
                        } else {
                            var d3matrix = new D3Matrix('matrix', network)
                            this.setState({
                                network: network,
                                d3matrix: d3matrix
                            })
                        }
                    }
                }, 10)
            }, 10)
        } else {
            this.setState({
                loading: false
            })
        }
    }

    handleNetworkMouseEnter(d, rect) {

        var x = rect.x
        var y = rect.y

        fetch(`/api/expression/${d.gene_id}`)
        .then(response => {
            if (!response.ok) throw response
            return response.json()
        })
        .then(exp => {
            document.getElementById('d3networktooltip').innerHTML = ''
            var histogram = new D3Histogram('d3networktooltip', d, exp)
            this.state.d3network.showTooltip({x: x, y: y})
        })
        .catch(error => {
            console.error(error)
            alert(error.statusText || error)
        })
    }

    handleNetworkMouseLeave(d) {
        this.state.d3network.hideTooltip()
    }

    loadNetwork(query) {
        fetch('/api/network/' + query)
        .then(response => {
            if (!response.ok) throw response
            return response.json()
        })
        .then(this.handleServerResponse)
        .catch(error => {
            console.error(error)
            alert(error.statusText || error)
        })
    }

    loadGWASGenes(query, mlog10p, exactTrait) {
        if (query.length < 4) {
            alert('sorry, could you phrase a longer word?')
            return
        }
        fetch(`/api/gwas?query=${query}&mlog10p=${mlog10p}&exactTrait=${exactTrait}`)
        .then(response => {
            if (!response.ok) throw response
            return response.json()
        })
        .then(this.handleServerResponse)
        .catch(error => {
            console.error(error)
            alert(error.statusText || error)
        })
    }

    onTabSelect(index, lastIndex, event) {
        this.setState({
            selectedTab: index
        })
        this.state.d3network && this.state.d3network.hideTooltip()
        if (index === 1 && !this.state.d3matrix) {
            setTimeout(() => {
                if (this.state.network.elements.nodes.length > 500) {
                    this.setState({
                        message: 'The matrix can only be shown for less than 500 genes'
                    })
                } else {
                    var d3matrix = new D3Matrix('matrix', this.state.network)
                    this.setState({
                        d3matrix: d3matrix
                    })
                }
            }, 10)
        } else if (index === 0 && !this.state.d3network) {
            setTimeout(() => {
                var d3network = new D3Network('network', this.state.network,
                {mouseenter: this.handleNetworkMouseEnter, mouseleave: this.handleNetworkMouseLeave, mousemove: this.handleNetworkMouseMove})
                this.setState({
                    d3network: d3network
                })
            }, 10)
        }
    }

    render() {

        if (this.state.loading) return <div className="centeredcontent">{this.state.loading}</div>

        const topContent = this.state.selectedTab == 0 ?
        <div style={{alignSelf: 'flex-start', paddingTop: '30px'}}>
        {this.state.traits.length > 0 ? this.state.traits.join(' / ') : this.state.genes.length + ' genes in the network, ' + this.state.not_found.length + ' genes not found'}
        </div> :
        <div style={{alignSelf: 'flex-start', paddingTop: '11px'}}>
        {this.state.traits.length > 0 ? this.state.traits.join(' / ') : this.state.genes.length + ' genes in the network, ' + this.state.not_found.length + ' genes not found'}
        </div>

        return (
            <div className="centeredcontent">
            {topContent}
            <Tabs forceRenderTabPanel={true} defaultIndex={this.state.selectedTab} onSelect={this.onTabSelect} style={{height: '100%', width: '100%'}}>
            <TabList>
            <Tab>Network</Tab>
            <Tab>Matrix</Tab>
            </TabList>
            <TabPanel style={{height: '100%', display: this.state.selectedTab == 0 ? 'block' : 'none'}}>
            <div id="network" style={{height: '100%', width: '100%'}}></div>
            </TabPanel>
            <TabPanel style={{height: '100%', display: this.state.selectedTab == 1 ? 'block' : 'none'}}>
            <div style={{paddingBottom: '10px'}}>
            <span style={{paddingRight: '5px'}}>Order by</span>
            <select id="order">
            <option value="cluster">cluster</option>
            <option value="chrpos">chromosome position</option>
            <option value="value">average coexpression</option>
            <option value="name">name</option>
            </select>
            </div>
            <div id="matrix" style={{height: '100%', width: '100%'}}>
            {this.state.message}
            </div>
            </TabPanel>
            </Tabs>
            </div>
        )
    }
}

export default Network
