import 'babel/register'
import store from './store'
import {get_data, loadTalksData} from './store'
import React from 'react'
import ColumnSelect from './ColumnSelect'
import ConversationsPlot from './ConversationsPlot'
import NodesSelect from './NodesSelect'
import CorrelationGraph from './CorrelationGraph'
import Playback from './Playback'
import '../less/main.less'
import {Tab, Tabs} from 'material-ui'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {root} from 'baobab-react/mixins'

injectTapEventPlugin();
get_data('data.json');
loadTalksData('talks.json');

let App = React.createClass({
  displayName: 'App',
  mixins: [root],
  render() {
    return (
      <Tabs initialSelectedIndex={1}>
      <Tab label="Measures comparision">
      <div className="tab-template-container">
        <div>X: <ColumnSelect value={store.select('x')}/></div>
        <div>Y: <ColumnSelect value={store.select('y')}/></div>
        <ConversationsPlot width={500} height={500} xcolumn={store.select('x')} ycolumn={store.select('y')}/>
      </div>
      </Tab>
      <Tab label="Correlations Graph">

      <div className="tab-template-container">
        <NodesSelect/>
        <CorrelationGraph width={800} height={800} selected={store.facets.selectedNodes}/>
      </div>

      </Tab>
      <Tab label="Turntaking playback">
        <Playback/>
      </Tab>
      </Tabs>
      );
  }
});

React.render(<App tree={store}/>, document.body);
