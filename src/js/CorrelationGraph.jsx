import d3 from 'd3'
import d3tip from 'd3-tip'
import _ from 'lodash'
import React from 'react'
import {branch} from 'baobab-react/mixins'
import store from './store'

export default React.createClass({
  displayName: 'CorrelationGraph',
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  mixins: [branch],
  cursors() {
    return {
      data: ['data', 'data'],
    };
  },

  facets: {
    selected: 'selectedNodes'
  },

  _ranksDict(seq) {
    if(seq === undefined){
      return undefined;
    }
    let sorted = _.sortBy(seq);
    let d = {};
    let last = seq[0];
    let count=0, sum=0;
    for(let i = 1; i <= sorted.length; ++i) {
      if(sorted[i-1] != last) {
        d[last] = sum / count;
        last = sorted[i - 1];
        count = 0;
        sum = 0;
      }
      ++count;
      sum += i;
    }
    d[last] = sum / count;
    return d;
  },

  _generateGraph() {
    let c = this.state;
    let vertices = _.map(c.selected, mm => ({name: mm[0]+'.'+mm[1], model: mm[0], measure: mm[1]}));
    let ranks = _.map(vertices, v => this._ranksDict(c.data[v.name]));
    let n = vertices.length;
    let edges = [];

    for(let i=0;i<vertices.length;++i) {
      for(let j=0;j<i;j++) {
        let n = c.data[vertices[i].name].length;
        let iranks = _.map(c.data[vertices[i].name], d => ranks[i][d] - (n + 1)/2);
        let jranks = _.map(c.data[vertices[j].name], d => ranks[j][d] - (n + 1)/2);
        let ivar = _.sum(_.map(iranks, r => r*r));
        let jvar = _.sum(_.map(jranks, r => r*r));
        let ranksCov = _.sum(_.map(_.zip(iranks, jranks), ([ri, rj]) => ri * rj));
        let spearmanCor = ranksCov / Math.sqrt(ivar * jvar);
        if(Math.abs(spearmanCor) > 0.4) {
          edges.push({
            source: i,
            target: j,
            cor: spearmanCor
          });
        }
      }
    }

    return [vertices, edges];
  },

  _tick() {
    this.link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    this.node.attr("x", d => d.x).attr("y", d => d.y);
  },

  _init() {
    let el = this.getDOMNode();
    this.area = d3.select(el)
      .append('svg')
        .attr('width', this.props.width)
        .attr('height', this.props.height)
      .append('g')
        .attr('class', 'area');
    this.node = this.area.selectAll('.node');
    this.link = this.area.selectAll('.link');
    this.force = d3.layout.force()
      .size([this.props.width, this.props.height]);
    this.tip = d3tip().attr('class', 'd3-tip').html(d => "Spearman: " + Math.round(1000*d.cor)/1000);
    this.area.call(this.tip);
  },

  _update() {
    let [nodes, links] = this._generateGraph();
    console.log('graph');
    console.log(this.state.selected);
    console.log(nodes);
    console.log(links);
    this.force
      .nodes(nodes)
      .links(links)
      .linkDistance(d => 200 * Math.sqrt(1 - Math.abs(d.cor)))
      .on('tick', this._tick)
      .gravity(0.01)
      .start();

    console.log(nodes);
    console.log(this.node);
    this.node = this.node.data(nodes, d => d.name);
    this.node.enter().insert('text', '.link')
      .attr('class', 'node')
      .attr('text-anchor', 'middle')
      .text(d => d.name)
      .call(this.force.drag);
    this.node.exit().remove();

    this.link = this.link.data(links, d => d.source.name + "-" + d.target.name);
    this.link.enter().insert('line')
      .attr('stroke', d => (d.cor >= 0) ? 'blue' : 'red')
      .attr('opacity', d => d.cor*d.cor)
      .attr('class', 'link')
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide)
      .on('click', this.clickLink);
    this.link.exit().remove();

    this._tick();
  },
  clickLink(d) {
    store.select('x').set([d.source.model, d.source.measure]);
    store.select('y').set([d.target.model, d.target.measure]);
  },
  componentDidMount() {
    this._init();
    this._update();
  },
  componentDidUpdate() {
    this._update();
  },
  render() {
    return <div className="correlation-graph"></div>;
  }
});
