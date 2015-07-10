import React from 'react'
import _ from 'lodash'
import {branch} from 'baobab-react/mixins'
import DefaultCheckbox from './DefaultCheckbox'

export default React.createClass({
  displayName: 'NodesSelect', 
  mixins: [branch],
  cursors() { 
    return {
      models: ['data', 'models'],
      measures: ['data', 'measures'],
      pairings: ['data', 'pairings'],
      value: ['checkboxesStates']
    };
  },

  setValue(key, value) {
    let newValue = _.clone(this.state.value);
    newValue[key] = value;
    this.cursors.value.set(newValue);
    this.context.tree.commit();
  },

  getValue(key) {
    return this.state.value[key]
  },

  getDefault(model, measure) {
    let modr = this.state.value[model + '.'];
    let mear = this.state.value['.' + measure];
    return (modr === undefined || mear === undefined) ? false : modr && mear;
  },

  render() {
    let c = this.state
    let m = this.state.model
    let meas = this.state.pairings[m]
    console.log(this.state.value);
    return (<div className="nodes-select"><table> 
      <thead><tr><td></td>{_.map(this.state.models, model => <td><DefaultCheckbox defaultValue={false} value={this.getValue(model.code+'.')} onValueChange={(value) => this.setValue(model.code + '.', value)} label={model.code}/></td>)}</tr></thead>
      <tbody>
        {_.map(this.state.measures, measure =>
          <tr><td key="measure"><DefaultCheckbox defaultValue={false} value={this.getValue('.' + measure.code)} onValueChange={(value) => this.setValue('.' + measure.code, value)} label={measure.code}/></td> + 
          {_.map(this.state.models, model => <td>{_.contains(c.pairings[model.code], measure.code) ? 
              <DefaultCheckbox defaultValue={this.getDefault(model.code, measure.code)} value={this.getValue(model.code + '.' + measure.code)} onValueChange={(value) => this.setValue(model.code + '.' + measure.code, value)}/> : []}</td>)}
          </tr>) }
      </tbody>
    </table></div>);
  }
});
