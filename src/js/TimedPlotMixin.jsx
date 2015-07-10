import d3 from 'd3'
import _ from 'lodash'
import React from 'react'

export default {
  getMargin() {
    return { top: 50, left: 50, bottom: 50, right: 50};
  },

  setZoom() {
    console.log('setScale');
    console.log(d3.event);
    let z = { scale: d3.event.scale, translate: _.map(d3.event.translate, v => v / this._awidth)};
    this.getZoomCursor().set(z);
  },

  init() {
    let margin = this.getMargin();
    this._margin = margin;
    this._area = d3.select(this.getDOMNode())
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this._awidth = this.props.width - margin.left - margin.right;
    this._aheight = this.props.height - margin.top - margin.bottom;

    this._x = d3.scale.linear().range([0, this._awidth]);
    this._y = this.getYScale().range([this._aheight, 0]);

    this._zoom = d3.behavior.zoom().on('zoom', this.setZoom);

    this._pane = this._area.append('rect')
      .attr('class', 'pane')
      .attr('width', this._awidth)
      .attr('height', this._aheight)
      .call(this._zoom);
  },

  getXRange(zoom) {
    let s = this.state;
    let xhelper = d3.scale.linear().range([0, this._awidth]).domain(this.getExtent());

    let tstart = xhelper.invert(-this._awidth * zoom.translate[0] / zoom.scale);
    let tend = xhelper.invert(this._awidth * (1 - zoom.translate[0]) / zoom.scale);
    return [tstart, tend];
  },

  update() {
    console.log('Timed plot update');
    let z = this.getZoomCursor().get();

    this._zoom
      .scale(z.scale)
      .translate(_.map(z.translate, v => v * this._awidth));

    let [tstart, tend] = this.getXRange(z);
    console.log(z);
    console.log(this.getExtent());
    this._x.domain([tstart, tend]);
    this._y.domain(this.getYRange());

    let xAxis = d3.svg.axis().scale(this._x).orient('bottom');
    let yAxis = d3.svg.axis().scale(this._y).orient('left');

    this._area.selectAll('.axis').remove();
    this._area.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+this._aheight+')')
      .call(xAxis);
    this._area.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    this.updateContent([tstart, tend]);
  },

  componentDidMount() {
    this.init();
    this.update();
  },

  componentDidUpdate() {
    this.update();
  },

  render() {
    return <g></g>;
  },
}
