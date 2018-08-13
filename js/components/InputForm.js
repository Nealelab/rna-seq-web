import React from 'react'
import config from '../config'

class InputForm extends React.Component {

    constructor(props) {
        super(props)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.setStateFromProps = this.setStateFromProps.bind(this)
        this.setStateFromProps(props, true)
    }

    setStateFromProps(props, direct) {
        const loc = props.location.pathname.split(/\//)
        var genes = ''
        if (loc[1] == 'gene') {
            genes = loc[2]
        }
        if (loc[1] == 'network' && loc.length == 3) {
            genes = loc[2]
        }
        const isGwas = (loc[1] == 'network' && loc.length == 5)
        if (direct) {
            this.state = {
                genes: genes,
                gwas: isGwas ? loc[2] : '',
                mlogp: isGwas ? +loc[3] : config.gwas.defaultGwasMlogpThreshold,
                exactTrait: isGwas ? loc[4] == 'true' : false
            }
        } else {
            this.setState({
                genes: genes,
                gwas: isGwas ? loc[2] : '',
                mlogp: isGwas ? +loc[3] : config.gwas.defaultGwasMlogpThreshold,
                exactTrait: isGwas ? loc[4] == 'true' : false
            })
        }
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        if (name == 'genes') {
            this.setState({
                [name]: value,
                'gwas': ''
            })
        } else {
            this.setState({
                [name]: value
            })
        }
    }

    handleSubmit(event) {
        event.preventDefault()
        if (this.state.gwas) {
            this.props.history.push(`/network/${this.state.gwas}/${this.state.mlogp}/${this.state.exactTrait}`)
        } else if (this.state.genes) {
            const query = this.state.genes.trim().replace(/\s/g, ',')
            const split = query.split(/[,;:|\s]/)
            if (split.length == 1) {
                this.props.history.push(`/gene/${query}`)
            } else {
                this.props.history.push(`/network/${query}`)
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setStateFromProps(nextProps, false)
    }

    render() {
        return (
            <div style={{display: 'flex', flexFlow: 'column nowrap', justifyContent: 'flex-start', flexBasis: '20%', minWidth: '300px', marginRight: '10px'}}>
            <div style={{flexBasis: '30%'}}>
            <form onSubmit={this.handleSubmit}>
            <textarea name='genes' style={{border: '0', width: '100%'}} className='sharp' autoFocus placeholder='Type a gene or&#10;paste a list of genes' rows={10} value={this.state.genes} onChange={this.handleInputChange} /><br/>
            <div style={{textAlign: 'center'}}>or</div>
            <input name='gwas' style={{border: '0', margin: '5px 0', width: '100%'}} className='sharp' type='text' placeholder='Type a GWAS trait' value={this.state.gwas} onChange={this.handleInputChange} />
            <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', visibility: this.state.gwas ? 'visible' : 'hidden'}}>
            <div>exact trait name</div>
            <input name="exactTrait" type="checkbox" checked={this.state.exactTrait} onChange={this.handleInputChange} />
            </div>
            <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', visibility: this.state.gwas ? 'visible' : 'hidden'}}>
            <div>-log10 threshold</div>
            <input name='mlogp' style={{width: '20px', border: '0'}} className='sharp' type='text' value={this.state.mlogp} onChange={this.handleInputChange} />
            </div>
            <input className='sharp button' style={{marginTop: '10px', width: '100%', cursor: 'pointer'}} type="submit" value="Go" />
            </form>
            </div>
            <div style={{padding: '10px 0', overflow: 'auto'}}>
            </div>
            </div>
        )
    }
}

export default InputForm
