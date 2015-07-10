import d3 from 'd3'
import _ from 'lodash'
import React from 'react'
import {branch} from 'baobab-react/mixins'

export default React.createClass({
  displayName: 'ConversationsPlot',
  mixins: [branch],
  cursors(props) {
    return {
      xcolumn: props.xcolumn,
      ycolumn: props.ycolumn,
      data: ['data', 'data']
    };
  },
  propTypes: {
    xname: React.PropTypes.string,
    yname: React.PropTypes.string
  },

  _margin: {top: 10, right: 30, bottom: 30, left: 50},

  _init() {
    var el = this.getDOMNode();
    this._svg = d3.select(el).append('svg')
        .attr('class', 'd3')
        .attr('width', this.props.width)
        .attr('height', this.props.height)
      .append('g')
        .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
    this._width = this.props.width - this._margin.left - this._margin.right;
    this._height = this.props.height - this._margin.top - this._margin.bottom;

    this._x = d3.scale.linear()
      .range([0, this._width]);
    this._y = d3.scale.linear()
      .range([this._height, 0]);
  },
  
  _update() {
    let c = this.state;
    let xvals = c.data[c.xcolumn[0] + '.' + c.xcolumn[1]];
    let yvals = c.data[c.ycolumn[0] + '.' + c.ycolumn[1]];
    console.log(xvals);
    if(xvals) {
      this._x.domain(d3.extent(xvals)).nice();
    }
    if(yvals) {
      this._y.domain(d3.extent(yvals)).nice();
    }

    this._xAxis = d3.svg.axis()
      .scale(this._x)
      .orient('bottom');
    this._yAxis = d3.svg.axis()
      .scale(this._y)
      .orient('left');

    this._svg.selectAll('.axis').remove();

    this._svg.append('g')
        .attr('class', 'x axis')
        .attr("transform", "translate(0," + this._height + ")")
        .call(this._xAxis);
    this._svg.append('g')
      .attr('class', 'y axis')
      .call(this._yAxis);

    if(xvals) {
      let dots = this._svg.selectAll('circle').data(_.range(xvals.length));
      dots.enter()
        .append('circle')
        .attr('r', 3);

      dots
        .transition()
        .attr('cx', i => this._x(xvals[i]))
        .attr('cy', i => this._y(yvals[i]));
    }

  },

  componentDidMount() {
    this._init();
    this._update();
  },

  componentDidUpdate() {
    this._update();
  },

  render: function() {
    return (<div className="ConversationsPlot"></div>);
  }
});
