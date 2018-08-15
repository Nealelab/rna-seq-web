import React from 'react'

class Contact extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div style={{padding: '0 10px'}}>
            <p>Do you have questions or comments? Interested in contributing to the development of this resource? Want to do gene expression research with us? Contact us at jkarjala (at) broadinstitute.org</p>
            <p>This work has been done at the <a href="https://www.broadinstitute.org/">Broad Institute</a>, <a href="http://www.atgu.mgh.harvard.edu/">ATGU</a> and <a href="https://www.fimm.fi/">FIMM</a>.</p>
            </div>
        )
    }
}

export default Contact
