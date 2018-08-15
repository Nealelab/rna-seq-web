import React from 'react'

class Download extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div style={{padding: '0 10px'}}>
            <p>The data on this website are available for download from Google Cloud:</p>
            <table className='download'>
            <tbody>
            <tr>
            <td>gs://brain-network/v1/brain-network-v1-samples.txt.gz</td>
            <td style={{textAlign: 'right'}}>5.8M</td>
            <td>metadata of the 4,040 runs</td>
            </tr>
            <tr>
            <td>gs://brain-network/v1/brain-network-v1-genes.txt.gz</td>
            <td style={{textAlign: 'right'}}>118K</td>
            <td>list of the 37,289 genes</td>
            </tr>
            <tr>
            <td>gs://brain-network/v1/brain-network-v1-log2tpm.txt.gz</td>
            <td style={{textAlign: 'right'}}>938M</td>
            <td>log2 tpm gene expression matrix before covariate correction</td>
            </tr>
            <tr>
            <td>gs://brain-network/v1/brain-network-v1-log2tpm-corrected.txt.gz</td>
            <td style={{textAlign: 'right'}}>1.1G</td>
            <td>log2 tpm gene expression matrix after covariate correction</td>
            </tr>
            <tr>
            <td>gs://brain-network/v1/brain-network-v1-log2tpm-corrected-network.txt.gz</td>
            <td style={{textAlign: 'right'}}>2.9G</td>
            <td>gene co-expression network</td>
            </tr>
            </tbody>
            </table>
            <br/>
            <p>Please install <a href="https://cloud.google.com/sdk/">Cloud SDK</a> to download the files.<br/>
            <code>gsutil -m cp gs://brain-network/v1/brain-network-v1* . </code>will download all files.</p>
            <p>To load the expression matrix in R:<br/>
            <code>
            install.packages("data.table")<br/>
            require(data.table)<br/>
            data {"<"}- fread("gunzip -c brain-network-v1-log2tpm-corrected.txt.gz")<br/>
            genes {"<"}- fread("gunzip -c brain-network-v1-genes.txt.gz") # genes will correspond to the rows of the data
            </code>
            </p>
            </div>
        )
    }
}

export default Download
