import * as d3 from 'd3'
import colors from '../color'
import config from '../config'

function D3Histogram(elemId, gene, expression) {

    if (!expression) {
        expression = gene.expression
    }

    if (false === (this instanceof D3Histogram)) {
        return new D3Histogram(elemId, gene, expression)
    }

    this._expression = expression
    this._svg = d3.select(`#${elemId}`)
    .append("div")
    .html(gene.gene_name)
    .append("svg")

    this._setSize(elemId)
    this._init(expression)
}

D3Histogram.prototype._setSize = function(elemId) {
    this._margin = config.histogram.margin.small
    this._width = document.querySelector(`#${elemId}`).clientWidth - this._margin.left - this._margin.right
    this._height = document.querySelector(`#${elemId}`).clientHeight - this._margin.top - this._margin.bottom
    this._svg
    .attr("width", this._width + this._margin.left + this._margin.right)
    .attr("height", this._height + this._margin.top + this._margin.bottom)
}

// https://bl.ocks.org/d3noob/96b74d0bd6d11427dd797892551a103c
D3Histogram.prototype._init = function(expression) {

    expression = expression.map(e => {
        return e < config.histogram.maxLog ? e : config.histogram.maxLog
    })

    var x = d3.scaleLinear()
    .domain([0, config.histogram.maxLog + 0.5])
    .range([0, this._width])

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(config.histogram.ticks))
        (expression)

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length })])
        .range([this._height, 0])

    var g = this._svg.append("g")
    .attr("transform",
          "translate(" + this._margin.left + "," + this._margin.top + ")")

    var bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")" })

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return this._height - y(d.length) }.bind(this))
}

export default D3Histogram
