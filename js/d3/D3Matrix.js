import * as d3 from 'd3'
import colors from '../color'
import config from '../config'

function D3Matrix(elemId, network) {

    if (false === (this instanceof D3Matrix)) {
        return new D3Matrix(elemId, network)
    }

    this._elemId = elemId
    this._network = network

    this._svg = d3.select(`#${elemId}`)
    .append("svg")

    this._setSize()
    this._init(network)
}

D3Matrix.prototype._setSize = function() {

    var margin = config.matrix.margin
    this._width = document.querySelector(`#${this._elemId}`).clientWidth - margin.left - margin.right
    this._height = document.querySelector(`#${this._elemId}`).clientHeight - margin.top - margin.bottom
    this._left = document.querySelector(`#${this._elemId}`).offsetLeft
    this._top = document.querySelector(`#${this._elemId}`).offsetTop

    this._width = Math.min(this._width, this._height)
    this._height = this._width

    this._svg = this._svg
    .attr("width", this._width + margin.left + margin.right)
    .attr("height", this._height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

}

// view-source:https://bost.ocks.org/mike/miserables/
D3Matrix.prototype._init = function(network) {

    var x = d3.scaleBand().rangeRound([0, this._width]),
    z = d3.scaleLinear().domain([0, 1]).clamp(true)

    var matrix = [],
    nodes = network.elements.nodes,
    n = nodes.length;

    nodes.forEach(function(node, i) {
        node.value = 0;
        node.index = i;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert links to matrix
    network.elements.links.forEach(function(link) {
        matrix[link.source.index][link.target.index].z += link.weight;
        matrix[link.target.index][link.source.index].z += link.weight;
    });

    // keep averages for nodes and their self-coexpression
    network.elements.allLinks.forEach(function(link) {
        matrix[link.source.index][link.source.index].z += link.weight / n;
        matrix[link.target.index][link.target.index].z += link.weight / n;
        nodes[link.source.index].value += link.weight / n;
        nodes[link.target.index].value += link.weight / n;
    })

    if (!config.matrix.selfThresholds) {
        config.matrix.selfThresholds = [
            nodes.reduce((acc, cur, i) => {
                acc = Math.min(acc, cur.value)
                return acc
            }, Number.MAX_VALUE),
            nodes.reduce((acc, cur, i) => {
                acc = Math.max(acc, cur.value)
                return acc
            }, -Number.MAX_VALUE)
        ]
    }

    var colorSelf = d3.scaleLinear().domain([config.matrix.selfThresholds[0], 0, config.matrix.selfThresholds[1]]).range(config.matrix.selfColors)

    // Precompute the orders.
    var orders = {
        cluster: d3.range(n).sort(function(a, b) { return nodes[a].cluster - nodes[b].cluster; }),
        chrpos: d3.range(n).sort(function(a, b) {
            var a = nodes[a]
            var b = nodes[b]
            if (a.seqname == b.seqname) return a.start - b.start
            else if (a.seqname == 'chrY') return 1
            else if (a.seqname == 'chrX') return b.seqname == 'chrY' ? -1 : 1;
            else return (+a.seqname.replace('chr', '') - +b.seqname.replace('chr', ''))
        }),
        value: d3.range(n).sort(function(a, b) { return nodes[b].value - nodes[a].value; }),
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].gene_name, nodes[b].gene_name); }),
    };

    // The default sort order.
    x.domain(orders.cluster);

    var row = this._svg.selectAll(".row")
    .data(matrix)
    .enter().append("g")
    .attr("class", "row")
    .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
    .each(row);

    row.append("text")
    .attr("x", -6)
    .attr("y", x.bandwidth() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .style("cursor", "pointer")
    .text(function(d, i) { return nodes[i].gene_name; })
    .style("font-size", function(d, i) {
        return x.bandwidth()
    })
    .on("mouseenter", textMouseenter)
    .on("mouseleave", textMouseleave)

    var column = this._svg.selectAll(".column")
    .data(matrix)
    .enter().append("g")
    .attr("class", "column")
    .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("text")
    .attr("x", 6)
    .attr("y", x.bandwidth() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .style("cursor", "pointer")
    .text(function(d, i) { return nodes[i].gene_name; })
    .style("font-size", function(d, i) {
        return x.bandwidth()
    })

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth())
        .style("fill-opacity", function(d) {
            if (d.x == d.y) {
                return 1
            } else {
                return z(d.z - network.threshold + 0.2);
            }
        })
        .style("fill", function(d) {
            if (d.x == d.y) {
                return colorSelf(d.z);
            } else {
                return nodes[d.x].cluster < colors.length ? colors[nodes[d.x].cluster] : config.network.nodes.defaultColor;
            }
        })
        .on("mouseenter", mouseenter)
        .on("mouseleave", mouseleave)
    }

    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "d3tooltip")
        .style("opacity", 0)

    this._svg.on("mousemove", mousemove)

    function mousemove(p) {
        var elem = document.elementFromPoint(d3.event.clientX, d3.event.clientY)
        if (elem.tagName == 'svg') {
            tooltipDiv
            // .transition().duration(100)
            .style("opacity", 0)
        }
    }

    function mouseenter(p) {
        tooltipDiv
        .html(() => {
            if (p.x == p.y) {
                return `${network.elements.nodes[p.x].gene_name}<br/>mean(r) = ${Math.round(1000 * p.z)/1000}`
            } else {
                return `${network.elements.nodes[p.x].gene_name}<br/>${network.elements.nodes[p.y].gene_name}<br/>r = ${Math.round(1000 * p.z)/1000}`
            }
        })
        .style("left", (d3.event.x - 35) + "px")
        .style("top", (d3.event.y - 50) + "px")
        .style("opacity", 0.7)

        d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
        //d3.selectAll(".row rect").filter(function(d, i) { return d.y == p.y && d.x == p.x }).style("height", x.bandwidth() * 2);
        d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }

    function mouseleave() {
        tooltipDiv
        .style("opacity", 0)
        d3.selectAll("text").classed("active", false);
    }

    function textMouseenter(p) {
        d3.selectAll(".row text").classed("highlight", function(d, i) {
            return d.filter(item => {
                if (i != p[0].y && p[0].y == item.x && item.z != 0) {
                    return true
                }
                return false
            }).length > 0
        });
        d3.selectAll(".row text").classed("active", function(d, i) { return i == p[0].y; });
        d3.selectAll(".column text").classed("active", function(d, i) { return i == p[0].y; });
        d3.selectAll(".row rect").classed("active", function(d, i) { return d.y == p[0].y || d.x == p[0].y});
    }

    function textMouseleave(p) {
        tooltipDiv
        .style("opacity", 0)
        d3.selectAll("text").classed("active", false);
        d3.selectAll("text").classed("highlight", false);
        d3.selectAll("rect").classed("active", false);
    }


    var zoom_handler = d3.zoom()
    .scaleExtent([0.05, 20])
    .on("zoom", zoom_actions)

    //TODO
    //zoom_handler(this._svg)//.select("g"))
    function zoom_actions() {
        svg.attr("transform", d3.event.transform)
    }

    d3.select("#order").on("change", function() {
        order(this.value);
    });

    var svg = this._svg
    function order(value) {

        x.domain(orders[value]);
        var t = svg.transition().duration(config.matrix.transition.duration);

        t.selectAll(".row")
        .delay(function(d, i) { return x(i) * config.matrix.transition.delay; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .selectAll(".cell")
        .delay(function(d) { return x(d.x) * config.matrix.transition.delay; })
        .attr("x", function(d) { return x(d.x); });

        t.selectAll(".column")
        .delay(function(d, i) { return x(i) * config.matrix.transition.delay; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }
}

export default D3Matrix
