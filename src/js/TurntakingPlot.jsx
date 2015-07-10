import _ from 'lodash'
import d3 from 'd3'
import React from 'react'
import {branch} from 'baobab-react/mixins'

import TimedPlotMixin from './TimedPlotMixin'

export default React.createClass({
  displayName: 'TurntakingPlot',
  mixins: [branch, TimedPlotMixin],
  cursors(props) {
    return {
      zoom: props.zoom,
      extent: props.extent,
      turntaking: props.data.select('turntaking'),
      rms: props.data.select('rms'),
      step: props.data.select('step'),
      position: props.position
    };
  },

  getZoomCursor() {
    return this.cursors.zoom;
  },

  getYScale() {
    return d3.scale.log();
  },

  getYRange() {
    return [1e-4, 1];
  },

  getExtent() {
    return this.state.extent;
  },

  updateTurntaking(extent) {
    console.log('Update turntaking');
    let s = this.state;
    let [tstart, tend] = extent;

    let istart = Math.max(0, Math.floor(tstart / s.step));
    let iend = Math.min(Math.ceil(tend / s.step) + 1, s.turntaking.length);

    let colors = ['white', 'orange', 'blue', 'gray'];

    let si = istart;
    let rects = [];
    for(let i = istart + 1; i < iend; ++i) {
      if(s.turntaking[i] != s.turntaking[si]) {
        rects.push({
          state: s.turntaking[si],
          start: si * s.step,
          end: i * s.step
        });
        si = i;
      }
    }
    rects.push({
      state: s.turntaking[si],
      start: si * s.step,
      end: iend * s.step
    });
    let statesDom = this._area.selectAll('.state-rect').data(rects);
    statesDom.exit().remove();
    statesDom.enter().append('rect')
      .attr('class', 'state-rect');
    statesDom
      .attr('x', d => this._x(d.start))
      .attr('width', d => this._x(d.end) - this._x(d.start))
      .attr('y', 0)
      .attr('height', this._aheight)
      .attr('fill', d => colors[d.state]);
  },

  updateRMS(extent) {
    console.log('Update RMS');
    let s = this.state;
    let [tstart, tend] = extent;

    let colors = ['orange', 'blue'];

    let istart = Math.max(0, Math.floor(tstart / s.step));
    let iend = Math.min(Math.ceil(tend / s.step) + 1, s.rms[0].length);

    let paths = [];
    for(let j = 0; j < s.rms.length; ++j) {
      let vals = s.rms[j];
      let d = `M${this._x(istart*s.step)},${this._y(vals[istart])}`;
      for(let i=istart+1; i < iend; ++i) {
        d += `L${this._x(i*s.step)},${this._y(vals[i])}`;
      }
      paths.push({
        d: d,
        channel: j
      });
    }

    console.log(paths);

    let rmsDom = this._area.selectAll('.rms').data(paths);
    rmsDom.exit().remove();
    rmsDom.enter().append('path').attr('class', 'rms');
    rmsDom.attr('d', d => d.d).attr('stroke', d => colors[d.channel]);
  },

  updateCursor(extent) {
    let [tstart, tend] = extent;
    let s = this.state;
    let cursors = [s.position];
    if(s.position < tstart || s.position > tend) {
      cursors = [];
    }
    let cursorElement = this._area.selectAll('.cursor').data(cursors);
    cursorElement.exit().remove();
    cursorElement.enter().append('line').attr('class', 'cursor');
    cursorElement
      .attr('x1', d => this._x(d))
      .attr('x2', d => this._x(d))
      .attr('y1', 0)
      .attr('y2', this._aheight);
  },

  componentDidMount() {
    console.log(this.__facet);
  },

  updateContent(extent) {
    console.log('Update content');
    let s = this.state;
    let [tstart, tend] = extent;

    console.log(s);

    if(!!s.turntaking && !!s.step) {
      this.updateTurntaking(extent);
    }
    if(!!s.rms && !!s.step) {
      this.updateRMS(extent);
    }
    if(!!s.position) {
      this.updateCursor(extent);
    }
  },
});
