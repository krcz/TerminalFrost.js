import React from 'react'
import {branch} from 'baobab-react/mixins'
import _ from 'lodash'

export default React.createClass({
  displayName: 'ColumnSelect', 
  mixins: [branch],
  cursors(props) { 
    return {
      value: props.value, 
      models: ['data', 'models'],
      measures: ['data', 'measures'],
      pairings: ['data', 'pairings']
    };
  },
  measureChange(event) {
    let measure = event.target.value;
    let model;
    if(this.state.value !== undefined) {
      [model,] = this.state.value;
    }
    this.cursors.value.set([model, measure])
  },
  modelChange(event) {
    let model = event.target.value
    let measure;
    if(this.state.value !== undefined) {
      [, measure] = this.state.value;
    }
    if(!_.contains(this.state.pairings[model], measure)) {
      measure = this.state.pairings[model][0];
    }
    this.props.value.set([model, measure])
  },
  render() {
    console.log(this.state);
    let c = this.state;
    let model, measure;
    if(c.value !== undefined) {
      [model, measure] = c.value;
    }
    let meas = c.pairings[model]
    return <div> 
      <select value={model} onChange={this.modelChange}>{[
        _.map(this.state.models, model => <option value={model.code}>{model.code}</option>)
      ]}</select>,
      <select value={measure} onChange={this.measureChange}>{[
        _.map(meas, x => <option value={x}>{x}</option>)
      ]}</select></div>

  }
});
