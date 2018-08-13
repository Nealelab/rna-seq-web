import AffinityPropagation from 'affinity-propagation'
import { quicksort } from './quicksort'
import config from '../config'

function convertNetworkForD3(data, threshold, doSquare) {

    var network = {
        elements: {
            nodes: data.genes,
            hashNodes: data.genes.reduce((acc, cur, i) => {
                acc[cur.gene_id] = i
                return acc
            }, {}),
            links: [],
            allLinks: [],
            groups: []
        },
        threshold: threshold,
        linkValueScales: [[0, 0.8, 1], [0, -0.8, -1]],
        linkColorScales: [['#ffffff', '#000000', '#ff3c00'], ['#ffffff', '#00a0d2', '#7a18ec']]
    }

    var i = 0
    for (var i1 = 0; i1 < network.elements.nodes.length - 1; i1++) {
        for (var i2 = i1 + 1; i2 < network.elements.nodes.length; i2++) {
            const link = {
                source: network.elements.nodes[i1],//.gene_id,
                target: network.elements.nodes[i2],//.gene_id,
                weight: doSquare ? Math.pow(data.network[i], 2) : data.network[i]
            }
            network.elements.allLinks.push(link)
            if (data.network[i] >= network.threshold) {
                network.elements.links.push(link)
            }
            i++
        }
    }

    return network
}

function cluster(data, network) {

    if (config.time) {
        console.time('affinityPropagation')
    }

    var clusters = AffinityPropagation.getClusters(data.network, {symmetric: true, preference: -1, damping: 0.8})
    if (clusters.exemplars.length === 1) {
        clusters = AffinityPropagation.getClusters(data.network, {symmetric: true, preference: 'min', damping: 0.8})
    }

    var clusterGroups = []
    var clusterHash = {}
    clusters.exemplars.forEach((exemplar, i) => {
        var group = {
            nodes: [],
            type: 'cluster',
            exemplar: network.elements.nodes[exemplar].gene_id
        }
        clusterGroups.push(group)
        clusterHash[exemplar] = group
    })

    clusters.clusters.forEach((exemplar, i) => {
        clusterHash[exemplar].nodes.push(network.elements.nodes[i].gene_id)
    })

    clusterGroups = clusterGroups.sort((a, b) => b.nodes.length - a.nodes.length)
    clusterGroups.forEach((group, i) => {
        group.name = 'Cluster ' + (i + 1)
        group.index_ = i
        group.nodes.forEach(node => {
            network.elements.nodes[network.elements.hashNodes[node]].cluster = i
        })
    })
    Array.prototype.push.apply(network.elements.groups, clusterGroups)

    if (config.time) {
        console.timeEnd('affinityPropagation')
    }
}

export { convertNetworkForD3, cluster }
