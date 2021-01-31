import numpy as np
import pandas as pd
import io
import gzip
import time
import re
import copy
from collections import OrderedDict

import config

class DataWorkshop(object):

    def __init__(self):
        self.samples = self.load_samples(config.data['sample_file'])
        self.expression = self.load_data(config.data['expression_file'], 'expression')
        self.genes = self.load_genes(config.data['gene_file'], config.data['gtf_matrix_file'])
        self.network = self.load_data(config.data['network_file'], 'network')
        if 'pca_file' in config.data:
            self.pca = self.load_pca(config.data['pca_file'])
        else:
            self.pca = None
        if 'pc_file' in config.data:
            self.pcs = self.load_pcs(config.data['pc_file'])
        else:
            self.pcs = None
        if not len(self.samples) == len(self.expression[0]):
            raise Exception('Illegal data file(s): Number of samples does not match in sample file ({}) and expression file ({})'.format(len(self.samples), len(self.expression[0])))
        if not len(self.genes['df_genes']) == len(self.expression) == len(self.network):
            raise Exception('Illegal data file(s): Number of genes does not match in all files')
        if 'pc_file' in config.data and not len(self.expression) == len(self.pcs):
            raise Exception('Illegal data file(s): Number of genes does not match in pc file')
        self.gwas_catalog = pd.read_csv(config.data['gwas_catalog_file'], sep='\t')

    def sample_source(self, row):
        source = ''
        for column in config.data['sample_source_columns']:
            if not pd.isna(row[column]):
                source = row[column]
                break
        return source

    def sample_description(self, row):
        description = ''
        for column in config.data['sample_description_columns']:
            if not pd.isna(row[column]):
                description = row[column]
                break
        return description

    def get_pca(self):
        if self.pca is None:
            return None
        return self.pca.to_dict()

    def load_data(self, file, name):
        print('loading {} data'.format(name))
        start = time.time()
        npz_file = file.replace('.txt.gz', '.npz')
        try:
            f = np.load(npz_file)
            data = f.f.arr_0
            end = time.time()
            print('{0} data loaded in {1:.2f} seconds. {2:.2f} gigabytes'.format(name, end - start, data.nbytes/pow(1000,3)))
        except FileNotFoundError as ex:
            print('loading data as text and converting to numpy format')
            start = time.time()
            data = np.loadtxt(file, dtype='f2', skiprows=1)
            np.savez(npz_file, data)
            print('data saved to {}'.format(npz_file))
            end = time.time()
            print('{0} data loaded in {1:.2f} seconds. {2:.2f} gigabytes'.format(name, end - start, data.nbytes/pow(1000,3)))
        return data

    def load_pcs(self, pc_file):
        return np.loadtxt(pc_file, dtype="f2", skiprows=1)

    def load_genes(self, gene_file, gtf_matrix_file):
        print('loading genes')
        df_genes = pd.read_csv(gtf_matrix_file, sep='\t')
        with open(gene_file, 'r') as f:
            ensgs = [ensg.strip() for ensg in f.readlines() if ensg]
        df_genes = df_genes[df_genes['gene_id'].isin(ensgs)]
        if (len(df_genes) != len(ensgs)):
            raise Exception('Gene ids in the gene file ({}) were not found in the annotation file ({})'.format(len(ensgs), len(df_genes)))
        ensg_index = dict(zip(ensgs, range(len(ensgs))))
        df_genes['rank'] = df_genes['gene_id'].map(ensg_index)
        df_genes.sort_values('rank', inplace=True)
        df_genes['ensg'] = df_genes['gene_id'].str.split('.').str[0]
        df_genes['gene_name_upper'] = df_genes['gene_name'].str.upper()
        df_genes['avg_log2tpm'] = np.sum(self.expression,axis=1) / len(self.expression[0])
        df_genes.fillna(0, inplace=True)
        genelist = df_genes.to_dict(orient='records')
        d = {}
        duplo_gene_names = set()
        for gene in genelist:
            d[gene['gene_id']] = gene
            d[gene['ensg']] = gene
            if gene['gene_name_upper'] in d and gene['gene_name_upper'] not in duplo_gene_names:
                duplo_gene_names.add(gene['gene_name'])
            d[gene['gene_name_upper']] = gene
        print('{} gene names map to several ensembl ids'.format(len(duplo_gene_names)))
        print('{} genes, {} gene names loaded'.format(len(df_genes), len(d)))
        return {'df_genes': df_genes, 'genelist': genelist, 'dict_genenames': d, 'duplo_gene_names': duplo_gene_names}

    def load_samples(self, sample_file):
        print('loading samples')
        df_samples = pd.read_csv(sample_file, sep='\t')
        if (config.data['gut_or_brain'] == 'brain'):
            df_samples['source_combined'] = df_samples.apply(self.sample_source, axis=1)
            df_samples['description_combined'] = df_samples.apply(self.sample_description, axis=1)
        df_samples.fillna(0, inplace=True)
        print('{} samples loaded'.format(len(df_samples)))
        return df_samples

    def load_pca(self, file):
        print('loading pca')
        df_pca = pd.read_csv(file, sep='\t')
        return df_pca

    def get_expression(self, rank):
        return self.expression[rank].tolist()

    def get_coexpressed(self, rank, n):
        ranks = self.network[rank].argsort()[-(n+1):][::-1]
        genes = [copy.deepcopy(self.genes['genelist'][r]) for r in ranks]
        for i, gene in enumerate(genes):
            gene['r'] = round(float(self.network[rank][ranks[i]]), 3)
        return genes[1:]

    def get_subnetwork(self, ranks):
        subnetwork = []
        for i, rank in enumerate(ranks):
            j = i + 1
            while j < len(ranks):
                subnetwork.append(round(float(self.network[rank][ranks[j]]), 3))
                j = j + 1
        return subnetwork

    def get_pcs(self, ranks):
        if self.pcs is None:
            return None
        pcs = []
        for i, rank in enumerate(ranks):
            pcs.append([])
            for j in range(1,5):
                pcs[i].append(float(self.pcs[i][j]))
        return pcs

    def get_top_samples(self, rank):
        temp = self.samples.reindex(self.expression[rank].argsort())
        temp = temp[len(temp)-config.data['num_top_samples']:].copy() # samples with highest expression
        temp['log2tpm'] = self.expression[rank][temp.index]
        return temp.to_dict(orient='records')[::-1]

    def get_all_samples(self, rank):
        return self.samples.to_dict(orient='records')

    def query_one_gene(self, query):
        q = query.upper()
        return self.genes['dict_genenames'][q] if q in self.genes['dict_genenames'] else None

    def query_genes(self, query):
        d = self.genes['dict_genenames']
        split_re = re.compile('[,;:|\s]')
        q_upper = list(filter(None, [q.upper() for q in split_re.split(query)]))
        if len(q_upper) > config.requests['max_genes_per_query']:
            raise Exception('a maximum of {} genes can be queried at a time'.format(config.requests['max_genes_per_query']), 413)
        found = [d[q] for q in q_upper if q in d]
        not_found = [q for q in q_upper if q not in d]
        # remove duplicates
        found = [dict(t) for t in set([tuple(d.items()) for d in found])]
        not_found = list(OrderedDict.fromkeys(not_found))
        return (found, not_found)

    def query_gwas_catalog(self, query, mlog10p=0, exactTrait=False):
        if exactTrait:
            records = self.gwas_catalog[(self.gwas_catalog['DISEASE/TRAIT'].str.upper() == query.upper()) & (self.gwas_catalog['PVALUE_MLOG'] > mlog10p)]
        else:
            records = self.gwas_catalog[(self.gwas_catalog['DISEASE/TRAIT'].str.upper().str.contains(query.upper())) & (self.gwas_catalog['PVALUE_MLOG'] > mlog10p)]
        reported = [str(r) for r in records['REPORTED GENE(S)'].tolist()]
        mapped = [str(r) for r in records['MAPPED_GENE'].tolist()]
        return {'reported': reported, 'mapped': mapped, 'traits': list(set(records['DISEASE/TRAIT']))}
