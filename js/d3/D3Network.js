import * as d3 from 'd3'
import colors from '../color'
import config from '../config'

function D3Network(elemId, network, handlers) {

    if (false === (this instanceof D3Network)) {
        return new D3Network(elemId, network, handlers)
    }

    var d3tooltip = document.getElementById('d3networktooltip')
    if (d3tooltip) {
        d3tooltip.parentNode.removeChild(d3tooltip)
    }

    this._elemId = elemId
    this._network = network
    this._svg = d3.select(`#${elemId}`)
    .append("svg")
    .attr("class", "networksvg")

    this._setSize()
    this._setScales()
    this._setKeys()
    this._initForce(network, handlers)

    this._state = {
        visibility: {
            nodes: true,
            links: true,
            labels: true
        },
        dragging: false
    }
}

D3Network.prototype._setSize = function() {

    this._width = document.querySelector(`#${this._elemId}`).clientWidth
    this._height = document.querySelector(`#${this._elemId}`).clientHeight - 10
    this._left = document.querySelector(`#${this._elemId}`).offsetLeft
    this._top = document.querySelector(`#${this._elemId}`).offsetTop

    this._svg.attr("width", this._width).attr("height", this._height)
}

D3Network.prototype._setScales = function() {

    this._linkColorScale = d3.scaleLinear()
    .domain([this._network.threshold, config.network.links.colorThresholds[0], config.network.links.colorThresholds[1]])
    .range(config.network.links.colors)
    .clamp(true)

    this._nodeSizeScale = d3.scaleLinear()
    .domain(config.network.nodes.sizeDomain)
    .range(config.network.nodes.sizeRange)
    .clamp(true)
}

D3Network.prototype._setKeys = function() {

    //document.querySelector(`#${this._elemId}`).onkeypress = e => {
    document.onkeypress = e => {
        var key = e.keyCode ? e.keyCode : e.which
        if (key == 110) { // 'n'
            this._svg
            .selectAll(".network-nodes")
            .selectAll("circle")
            .style("display", this._state.visibility.nodes ? "none" : "block")
            this._state.visibility.nodes = !this._state.visibility.nodes
        }
        if (key == 103) { // 'g'
            this._svg
            .selectAll(".network-nodes")
            .selectAll("text")
            .style("display", this._state.visibility.labels ? "none" : "block")
            this._state.visibility.labels = !this._state.visibility.labels
        }
        if (key == 108) { // 'l'
            this._svg
            .selectAll(".network-links")
            .selectAll("line")
            .style("display", this._state.visibility.links ? "none" : "block")
            this._state.visibility.links = !this._state.visibility.links
        }
    }
}

//https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4/38230545#38230545
D3Network.prototype.getTranslation = function() {
  const transform = d3.select("g").attr("transform")
  if (!transform) return transform
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttributeNS(null, "transform", transform);
  var matrix = g.transform.baseVal.consolidate().matrix;
  console.log(matrix)
  return [matrix.e, matrix.f];
}

D3Network.prototype._initForce = function(network, handlers) {

    // https://bl.ocks.org/mbostock/4055889
    function collide() {
      for (var k = 0, iterations = 4, strength = 0.5, padding = 5; k < iterations; ++k) {
        for (var i = 0, n = network.elements.nodes.length; i < n; ++i) {
          for (var a = network.elements.nodes[i], j = i + 1; j < n; ++j) {
            var b = network.elements.nodes[j],
                x = a.x + a.vx - b.x - b.vx,
                y = a.y + a.vy - b.y - b.vy,
                lx = Math.abs(x),
                ly = Math.abs(y),
                r = a.r + b.r + padding;
            if (lx < r && ly < r) {
              if (lx > ly) {
                lx = (lx - r) * (x < 0 ? -strength : strength);
                a.vx -= lx, b.vx += lx;
              } else {
                ly = (ly - r) * (y < 0 ? -strength : strength);
                a.vy -= ly, b.vy += ly;
              }
            }
          }
        }
      }
    }

    var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.gene_id }))
    .force("collide",d3.forceCollide().radius(13))
    //.force("collide", collide)
    .force("charge", d3.forceManyBody().strength(config.network.force.charge))
    .force("center", d3.forceCenter(this._width / 2, this._height / 2))
    .force("y", d3.forceY(0).strength(config.network.force.xy))
    .force("x", d3.forceX(0).strength(config.network.force.xy))
    .alphaMin(config.network.force.alphaMin)
    .alphaTarget(config.network.force.alphaTarget)
    //.velocityDecay(0.2)
    //.alphaDecay(0.05)

    var g = this._svg.append("g")

    var link = g.append("g")
    .attr("class", "network-links")
    .selectAll("line")
    .data(network.elements.links)
    .enter()
    .append("line")
    .attr("stroke-width", d => Math.sqrt(d.weight))
    .attr("stroke", d => this._linkColorScale(d.weight))

    var node = g.append("g")
    .attr("class", "network-nodes")
    .selectAll("g")
    .data(network.elements.nodes)
    .enter().append("g")

    node.append("circle")
    .attr("r", d => this._nodeSizeScale(d.avg_log2tpm))
    .attr("fill", d => {
        if (d.cluster != undefined) {
            return d.cluster < colors.length ? colors[d.cluster] : config.network.nodes.defaultColor
        } else {
            return 'black'
        }
    })

    node.append("text")
    .text(d => d.gene_name)
    .attr("dx", 3)
    .attr("dy", 10)

    node.call(d3.drag()
    .on("start", dragstarted.bind(this))
    .on("drag", dragged)
    .on("end", dragended.bind(this)))

    var that = this
    node.on("mouseenter", function(d) {
        if (!that._state.dragging) {
            handlers.mouseenter(d, this.getBoundingClientRect())
        }
    })
    node.on("mouseleave", handlers.mouseleave)

    node.on("click", d => {
        var win = window.open(`/gene/${d.gene_id}`, '_blank')
        win.focus()
    })

    this._svg.on("mousemove", function() {
        var elem = document.elementFromPoint(d3.event.clientX, d3.event.clientY)
        if (elem.tagName == 'svg') {
            this.hideTooltip()
        }
    }.bind(this))

    this._tooltipDiv = d3.select("body").append("div")
        .attr("id", "d3networktooltip")
        .attr("class", "d3tooltip")
        .style("opacity", 0)

    var ticked = function() {
        link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        node
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    simulation.nodes(network.elements.nodes)
    .on("tick", ticked)

    simulation.force("link").links(network.elements.links)

    var zoom_handler = d3.zoom()
    .scaleExtent([0.05, 20])
    .on("zoom", zoom_actions)
    zoom_handler(this._svg)

    function zoom_actions() {
        g.attr("transform", d3.event.transform)
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        this._state.dragging = true
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        this._state.dragging = false
    }
}

D3Network.prototype.showTooltip = function(xy) {

    this._tooltipDiv
    .style("left", (xy.x - 35) + "px")
    .style("top", (xy.y - 50) + "px");

    this._tooltipDiv
    // .transition().duration(100)
    .style("opacity", .8)
}

D3Network.prototype.hideTooltip = function() {

    this._tooltipDiv
    // .transition().duration(100)
    .style("opacity", 0)
}

export default D3Network
