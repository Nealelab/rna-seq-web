import React from 'react'
import config from '../config'
import D3Tree from '../d3/D3Tree'

class About extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        D3Tree('pathways', '/api/reactome')
    }

    render() {
        return (
            <div style={{padding: '0 10px'}}>
            <h2>Tool with no name</h2>
            <br/>

            <p>
            With this tool you can examine gene expression and co-expression patterns in the human brain and induced pluripotent stem cells.
            </p>
            <p>
            The data consists of 4,040 curated RNA-seq runs publicly available in the European Nucleotide Archive (ENA).
            ENA also contains data from the Gene Expression Omnibus (GEO) and Sequence Read Archive (SRA).
            These 4,040 runs come from 186 studies from several laboratories worldwide.
            </p>

            <h2>Data acquisition and quantification</h2>
            <br/>

            <p>
            We queried ENA on March 20th 2018 for human RNA-seq runs with more than one million reads each.
            After downloading all available information for 264,595 such runs, we identified potential brain and iPS cell runs by filtering the annotations for relevant words such as "brain", "cortex", and "neuron".
            We also filtered out runs for which fastq files were not directly available (requiring access via dbGaP).
            For this analysis we additionally filtered out runs that contained the words "single-cell" or "single cell" in their annotation.
            After these run identification and filtering steps we were left with 9,459 runs.
            </p>

            <p>
            We downloaded fastq files for the 9,459 runs from ENA to a Google Cloud bucket for joint reanalysis.
            We then quantified transcript expression in each run using Salmon 0.9.1 with Gencode v28 as the reference transcriptome.
            For runs with an average read length of greater than 61, we used a k-mer length of 31.
            For runs with an average read length of less than 62 but greater than 49, we used a k-mer length of 25.
            Runs with an average read length of less than 50 were excluded from the analysis.
            We used default Salmon options and did not apply bias corrections because of their limited effect in pairwise gene correlation and a substantial increase in runtime and cost.
            </p>

            <h2>Quality control</h2>
            <br/>

            <p>
            After quantifying transcript expression in transcripts per kilobase million (TPM) for each run, we first excluded runs in which less than 70 % of reads mapped to the transcriptome.
            We then only included runs coming from Illumina sequencers. For further gene-based analysis, we summed transcript expression for each gene and log2 transformed the gene-level TPMs.
            </p>

            <p>
            Upon examining the distribution of pairwise run correlation coefficients, we excluded runs which had a Pearson r lower than 0.4 with at least 100 other runs as these are likely to be failed runs, or bad quality or non-brain samples.
            We also excluded runs which had a Pearson r higher than 0.995 with at least one other run as these runs are likely to be duplicate submissions or near-identical replicates.
            Finally, we performed PCA over the remaining 4,967 runs (runs standard normalized).
            We excluded runs with a PC 1 loading higher than -0.0137 to arrive in a final set of 4,040 runs.
            </p>

            <h2>Correction for technical covariates</h2>
            <br/>

            <p>
            We did PCA again over the 4,040 runs with first genes and then runs standard normalized.
            We observed that several technical aspects of the runs correlated significantly with the first PCs.
            We then used a linear model to regress out effects of library layout (single/paired end), library type (stranded/unstranded, read direction), percentage of reads mapped, logarithm of the number of mapped reads, average read length and GC content.
            GC content was calculated using FastQC.
            </p>

            <p>
            We also correlated each study which had more than 100 quality controlled runs with the first PCs.
            Examining these studies and their correlations with the first PCs, we also added the study PRJNA319583 as a covariate as this study was done with tn-RNA-seq and correlated strongly with the first and fourth component for no obvious biological reason.
            We did not add the studies PRJEB14594 or PRJNA208369 as covariates despite their correlations with components two and three.
            PRJEB14594 consists of prenatal samples and PRJNA208369 consists of Universal Human Reference RNA and Human Brain Reference RNA, explaining a difference in expression compared to most other runs.
            </p>

            <h2>Co-expression network</h2>
            <br/>

            <p>
            Finally, we calculated Pearson correlation coefficients for each pair of genes from the residuals of the linear model, regressing out the effects of the technical covariates.
            These correlation coefficients form the co-expression network.
            </p>

            <div id='pathways' style={{display: 'none'}}></div>
            </div>
        )
    }
}

export default About
