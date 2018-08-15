import React from 'react'
import ReactTable from 'react-table'
import D3Histogram from '../d3/D3HistogramGeneInfo'
import config from '../config'
import { numberWithCommas } from '../util/utility'

class Gene extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            gene: null,
            samples: [],
            myGene: null,
            myGeneError: null,
            columns: [{
                Header: 'RUN',
                accessor: 'run_accession',
                Cell: props => <a href={'https://www.ebi.ac.uk/ena/data/view/' + props.value} target='_blank'>{props.value}</a>,
                width: 100
            }, {
                Header: 'TPM',
                accessor: 'log2tpm',
                Cell: props => {
                    var tpm = Math.pow(2, props.value) - 1
                    if (tpm < 100) tpm = tpm.toPrecision(2)
                    else tpm = Math.round(tpm)
                    return <span>{tpm}</span>
                },
                width: 50
            }, {
                Header: 'READS',
                accessor: 'read_count',
                Cell: props => numberWithCommas(props.value),
                width: 90
            }, {
                Header: 'SOURCE',
                accessor: 'source_combined',
                width: 250
            }, {
                Header: 'DESCRIPTION',
                accessor: 'description_combined'
            }, {
                id: 'study',
                Header: 'STUDY',
                accessor: d => d,
                Cell: props => <a href={'https://www.ebi.ac.uk/ena/data/view/' + props.original.study_accession} target='_blank'>{props.original.study_title}</a>
            }]
        }
        this.handleGeneResponse = this.handleGeneResponse.bind(this)
        this.loadGene = this.loadGene.bind(this)
        this.getMyGene = this.getMyGene.bind(this)
        this.loadGene(props.match.params.query)
    }

    handleGeneResponse(result) {
        this.setState({
            gene: result.gene,
            samples: result.samples
        })
        setTimeout(() => {
            this.getMyGene()
            if (this.state.histogram) {
                document.getElementById('histogram').innerHTML = ''
            }
            this.setState({
                histogram: new D3Histogram('histogram', this.state.gene)
            })
        }, 10)
    }

    loadGene(query) {
        fetch('/api/gene/' + query)
        .then(response => {
            if (!response.ok) throw response
            return response.json()
        })
        .then(this.handleGeneResponse)
        .catch(error => {
            alert(`${query}: ${error.statusText || error}`)
        })
    }

    getMyGene() {
        fetch(`http://mygene.info/v3/gene/${this.state.gene.ensg}`)
        .then(response => {
            if (!response.ok) throw response
            return response.json()
        })
        .then(result => {
            this.setState({
                myGene: result
            })
        })
        .catch(error => {
            this.setState({
                myGeneError: 'Could not fetch knowledge from mygene.info'
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.query !== nextProps.match.params.query) {
            this.loadGene(nextProps.match.params.query)
        }
    }

    render() {

        if (!this.state.gene) return null

        //TODO before <div>{this.state.gene.gene_type.replace(/_/g, ' ')}</div> ?
        //<div style={{flex: '2 0 auto'}}>

        return (
            <div className='geneinfo'>
            <div style={{flex: 1, maxWidth: '800px'}}>
            <div style={{fontWeight: 700}}>{this.state.gene.gene_name}</div>
            <div>{this.state.myGene ? this.state.myGene.name : ''}</div>
            <br/>
            <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start'}}>
            <div style={{minWidth: '170px'}}>
            <div>{this.state.gene.gene_type.replace(/_/g, ' ')}</div>
            <div>{this.state.gene.seqname}</div>
            <div>{numberWithCommas(this.state.gene.end - this.state.gene.start)} bases</div>
            <br/>
            <div><a href={'https://www.gtexportal.org/home/gene/' + this.state.gene.ensg}>GTEx</a></div>
            <div><a href={'http://gnomad.broadinstitute.org/gene/' + this.state.gene.ensg}>gnomAD</a></div>
            <div><a href={'http://genenetwork.nl/gene/' + this.state.gene.ensg}>genenetwork.nl</a></div>
            <div><a href={'http://ensembl.org/Homo_sapiens/Gene/Summary?g=' + this.state.gene.ensg}>{this.state.gene.ensg}</a></div>
            <div><a href={'http://35.231.69.87/' + this.state.gene.gene_name}>Target Gene Notebook</a></div>
            </div>
            <div style={{margin: '0 20px', fontWeight: 300}}>{this.state.myGeneError ? this.state.myGeneError : this.state.myGene ? this.state.myGene.summary : ''}</div>
            </div>
            <br/>
            </div>
            <div id='histogram' style={{flex: '1 1 500px', minHeight: '350px', width: '100%', maxWidth: '800px', margin: '20px 0'}}></div>
            <div>
            <div className='tableheading'>Runs with highest expression of {this.state.gene.gene_name}</div>
              <ReactTable
                data={this.state.samples}
                columns={this.state.columns}
                defaultPageSize={100}
                className="-striped -highlight"
              />
            </div>
            </div>
        )
    }
}

export default Gene
