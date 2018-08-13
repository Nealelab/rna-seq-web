from flask import Flask, request, Response, render_template, jsonify, url_for, send_from_directory
import re
from collections import OrderedDict
import copy

from data import DataWorkshop
import config

app = Flask(__name__)

dws = DataWorkshop()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def get_index(path):
    return render_template('index.html')

@app.route('/api/expression/<query>')
def get_expression(query):
    gene = dws.query_one_gene(query)
    if gene is not None:
        return jsonify(dws.get_expression(gene['rank']))
    else:
        return Response('expression for {} not found'.format(query), status=404, mimetype='text/plain')

@app.route('/api/gene/<query>')
def get_gene(query):
    gene = dws.query_one_gene(query)
    if gene is not None:
        gene = copy.deepcopy(gene)
        gene['expression'] = dws.get_expression(gene['rank'])
        samples = dws.get_samples(gene['rank'])
        return jsonify({'gene': gene, 'samples': samples})
    else:
        return Response('expression for {} not found'.format(query), status=404, mimetype='text/plain')

@app.route('/api/network/<query>')
def get_network(query):
    try:
        (found, not_found) = dws.query_genes(query)
    except Exception as e:
        print(e)
        msg, code = e.args
        return Response(msg, status=code, mimetype='text/plain')
    ranks = [g['rank'] for g in found]
    network = dws.get_subnetwork(ranks)
    return jsonify({'genes': found, 'not_found': not_found, 'network': network})

# args: query, mlog10p, exactTrait
@app.route('/api/gwas')
def get_gwas_network():
    gwasGenes = dws.query_gwas_catalog(request.args.get('query'), float(request.args.get('mlog10p')), request.args.get('exactTrait') == 'true')
    try:
        (found, not_found) = dws.query_genes(','.join(gwasGenes[config.data['gwas_gene_type']]))
    except Exception as e:
        msg, code = e.args
        return Response(msg, status=code, mimetype='text/plain')
    ranks = [g['rank'] for g in found]
    network = dws.get_subnetwork(ranks)
    return jsonify({'genes': found, 'not_found': [], 'network': network, 'traits': gwasGenes['traits']})

@app.route('/api/reactome')
def get_reactome():
    return send_from_directory(config.data_dir, config.data['pathways']['reactome']['json'])

if __name__ == '__main__':
    app.run(threaded=True, debug=True, host='0.0.0.0')
