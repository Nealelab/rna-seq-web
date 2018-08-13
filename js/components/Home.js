import React from 'react'

class Home extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {

        return (
            <div>
            <p>Welcome to XXX. This is a tool for exploring gene expression in the human brain.</p>
            <p>The data consists of 4,040 curated open-access RNA-seq samples downloaded from the Europen Nucleotide Archive.</p>
            <p>Please input a list of genes to examine their co-expression in this dataset.<br/>
            Please input a single gene to examine its expression.</p>
            <p>Read about the dataset and methodology here or download the data here.<br/>
            If you have any questions or are interested in gene expression research or development of this website, contact us.</p>
            </div>
        )
    }
}

export default Home
