import React from 'react'
import { Link } from 'react-router-dom'

class Home extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {

        return (
            <div style={{padding: '0 10px'}}>
            <p>Welcome to Brain Network. This is a tool for exploring gene expression in the human brain.</p>
            <p>The data consists of 4,040 curated open-access RNA-seq samples downloaded from the <a href="https://www.ebi.ac.uk/ena">Europen Nucleotide Archive</a>.</p>
            <p>Please input a list of genes to examine their co-expression in this dataset.<br/>
            Please input a single gene to examine its expression.</p>
            <p>Read about the dataset and methodology here or download the data <Link to="/about">here</Link>.<br/>
            If you have any questions or are interested in gene expression research or development of this website, <Link to="/contact">contact us</Link>.</p>
            </div>
        )
    }
}

export default Home
