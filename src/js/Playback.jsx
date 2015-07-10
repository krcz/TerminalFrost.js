import React from 'react'
import _ from 'lodash'
import {branch} from 'baobab-react/mixins'

import {loadTalkData} from './store'
import TurntakingPlot from './TurntakingPlot'

let StateRect = React.createClass({
  displayName: 'StateRect',
  mixins: [branch],
  cursors(props) {
    return {
      turntaking: props.turntaking,
      position: props.position,
      step: props.step
    }
  },

  render() {
    let s = this.state;
    let state = 'undefined';
    if(!!s.turntaking && !!s.position && !!s.step) {
      state = s.turntaking[Math.floor(s.position / s.step)];
    }
    return <div className={"state-rect state-" + state}></div>;
  }
});

export default React.createClass({
  displayName: 'Player',
  mixins: [branch],
  cursors() {
    return {
      data: ['talks'],
      talk: ['talk'],
      selected: ['playback', 'selected'],
      zoom: ['playback', 'zoom'],
      extent: ['playback', 'extent']
    };
  },

  getCurrentTalk(value) {
    let s = this.state;
    if(value === undefined) {
      value = s.selected;
    }
    if(!value) {
      return this.context.tree.select('fake');
    }
    let r = s.data.talks[s.data.map[value]];
    return r;
  },

  onSelect(e) {
    let s = this.state;

    let talk = this.getCurrentTalk(e.target.value);
    loadTalkData(talk.json);

    this.cursors.selected.set(e.target.value);
    this.cursors.zoom.set('translate', [0, 0]);
    this.context.tree.commit();
  },

  timeUpdated(e) {
    let s = this.state;
    let pos = this.refs.audio.getDOMNode().currentTime;
    this.context.tree.select('playback', 'position').set(pos);
    let tstart = -s.zoom.translate[0] * (s.extent[1] - s.extent[0]) / s.zoom.scale;
    let tend = (1 - s.zoom.translate[0]) * (s.extent[1] - s.extent[0]) / s.zoom.scale;

    if(pos > 0.8 * tend + 0.2 * tstart || pos <  tstart) {
      let trans = -pos / (s.extent[1] - s.extent[0]) * s.zoom.scale;
      this.cursors.zoom.set('translate', [trans, 0]);
    }
    this.context.tree.commit();
  },

  componentDidMount() {
    let audioElement = this.refs.audio.getDOMNode();
    audioElement.addEventListener('timeupdate', this.timeUpdated);
  },

  render() {
    let s = this.state;
    let vs = !s.data ? {} : s.data.map;
    let ctalk = this.getCurrentTalk();
    return <div>
      <div>
        <select value={s.selected || ''} onChange={this.onSelect}> {
          _.map(vs, (v, k) => <option value={k}>{k}</option>)
        }
        </select>
        <audio src={ctalk.audio} controls={true} ref="audio"/>
        <StateRect position={this.context.tree.select('playback', 'position')} step={this.cursors.talk.select('step')} turntaking={this.cursors.talk.select('turntaking')}/>
      </div>
      <div>
        <svg width={1000} height={800}>
          <TurntakingPlot width={1000} height={800} position={this.context.tree.select('playback', 'position')} data={this.cursors.talk} zoom={this.cursors.zoom} extent={this.cursors.extent} step={this.cursors.step}/>
        </svg>
      </div>
    </div>;
  }
});
