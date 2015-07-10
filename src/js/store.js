//import Papa from 'imports?Papa!exports?this.Papa!papaparse'
import Baobab from 'baobab'
import JSON from 'JSON'

let tree = new Baobab({
  data: {
    pairings: {},
    models: [],
    measures: [],
    data: {}
  },
  checkboxesStates: {},
  selectedNodes: [],
  talks: {},
  talk: {},
  playback: {
    zoom: {scale:1, translate: 0},
    extent: [0, 0]
  }
}, {
  facets: {
    selectedNodes: {
      cursors: {
        models: ['data', 'models'],
        measures: ['data', 'measures'],
        pairings: ['data', 'pairings'],
        s: ['checkboxesStates']
      },
      get(d) {
        console.log(['facet get', d]);
        if(d.models === undefined || d.measures === undefined) {
          return [];
        }
        let selected = []
        for(let model of d.models) {
          for(let measureCode of d.pairings[model.code]) {
            let v = d.s[model.code + '.' + measureCode];
            if(v === undefined) {
              v = d.s[model.code + '.'] === true && d.s['.' + measureCode] === true;
            }
            if(v) {
              selected.push([model.code, measureCode]);
            }
          }
        }
        return selected;
      }
    }
  }
});

export default tree

let data = tree.select('data')

data.on('update', () => console.log(data.get()))

export function get_data(url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function(e) {
    let d = JSON.parse(this.response);
    data.set(d);
    let modelCode = d.models[0].code;
    tree.select('x').set([modelCode, d.pairings[modelCode][0]]);
    tree.select('y').set([modelCode, d.pairings[modelCode][0]]);
    let nodesSelected = {'q.': true, 'm4et.': true};
    for(let m of d.measures) {
      nodesSelected['.' + m.code] = true;
    }
    tree.select('checkboxesStates').set(nodesSelected);
  }
  xhr.send();
}

export function loadTalksData(url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function(e) {
    let d = JSON.parse(this.response);
    let dmap = {};
    for(let i=0; i<d.talks.length; ++i) {
      let talk = d.talks[i];
      dmap[`${talk.pair}_${talk.topic}`] = i;
    }
    d.map = dmap;
    tree.select('talks').set(d);
  }
  xhr.send();
}

export function loadTalkData(url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function(e) {
    let d = JSON.parse(this.response);
    console.log(d);
    tree.select('talk').set(d);
    tree.select('playback', 'extent').set([0, d.step * d.turntaking.length]);
    tree.commit();
  }
  xhr.send();
  tree.select('talk').set({});
  tree.commit();
}
