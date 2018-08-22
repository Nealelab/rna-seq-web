port = 8000

requests = {
    'max_genes_per_query': 5000
}

data_dir = '/mnt/data/network/' # files from this directory can be sent out

data = {

    'sample_file': data_dir + '/4040-samples-pc1LT-0.0137.txt',
    'gene_file': data_dir + '/37289-genes.txt',
    'expression_file': data_dir + '/4040-samples-log2tpm.npz',
    'network_file': data_dir + '/4040-samples-log2tpm-corrected-onebyone-centered-network.npz',

    'gtf_matrix_file': data_dir + '/gencode.v28.annotation.gtf.matrix.txt.gz',
    'gwas_catalog_file': data_dir + '/gwas_catalog_v1.0.2-associations_e92_r2018-06-25.tsv.gz',

    'pathways': {
        'reactome': {
            'json': 'ReactomePathways-NeuronalSystem.json'
        }
    },

    'sample_source_columns': [
    'geo_source_name_ch1',
    'ARRAYEXPRESS_CHARACTERISTICS[CELL_TYPE]',
    'ARRAYEXPRESS_COMMENT[SAMPLE_SOURCE_NAME]',
    'ARRAYEXPRESS_CHARACTERISTICS[ORGANISM_PART]',
    'ARRAYEXPRESS_SOURCE_NAME',
    'SRA_source',
    'SRA_Body_Site',
    'sample_title'],

    'sample_description_columns': [
    'geo_description',
    'geo_characteristics_ch1',
    'ARRAYEXPRESS_COMMENT[SAMPLE_TITLE]',
    'ARRAYEXPRESS_COMMENT[SAMPLE_DESCRIPTION]',
    'ARRAYEXPRESS_COMMENT[SAMPLE_CHARACTERISTICS]'],

    'num_top_samples': 100,
    'gwas_gene_type': 'reported',

    'num_coexpressed_genes': 100
}
