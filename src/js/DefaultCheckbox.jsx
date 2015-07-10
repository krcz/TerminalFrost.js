import React from 'react'
import _ from 'lodash'
import {Checkbox} from 'material-ui'
import classNames from 'classnames'

export default React.createClass({
  displayName: 'DefaultCheckbox', 

  getInitialState() {
    return {
      lastClick: 0
    };
  },

  handleClick() {
    let thisClick = Date.now();

    if((thisClick - this.state.lastClick) < 1000) {
      this.props.onValueChange(undefined);
    }
    else {
      this.props.onValueChange(!this.props.value);
    }

    this.setState({lastClick: thisClick});
  },

  render() {
    let value = (this.props.value === undefined) ? this.props.defaultValue : this.props.value;
    let cls = classNames('default-checkbox', {'undefined': this.props.value == undefined});
    return <Checkbox disableTouchRipple={true} disableFocusRipple={true} className={cls} checked={value} onClick={this.handleClick} label={this.props.label}/>
  }
});
