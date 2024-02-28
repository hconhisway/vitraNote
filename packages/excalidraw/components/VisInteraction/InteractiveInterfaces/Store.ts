import {observable, computed, action, makeObservable} from 'mobx';
import {NodeMap, ApplicationState, defaultState} from './ApplicationState';
import {Provenance, initProvenance} from '@visdesignlab/trrack';

export default class Store {
  provenance: Provenance<ApplicationState, unknown, unknown>;
  isAtRoot: boolean = true;
  isAtLatest: boolean = true;
  selectedNode: string;
  nodePositions: NodeMap;

  constructor() {
    this.provenance = initProvenance<ApplicationState, unknown, unknown>(defaultState, false);
    this.selectedNode = defaultState.selectedNode;
    this.nodePositions = defaultState.nodePositions;

    // MobX 6 requires explicit call to makeObservable in the constructor
    makeObservable(this, {
      isAtRoot: observable,
      isAtLatest: observable,
      selectedNode: observable,
      nodePositions: observable,
      getNodePositions: computed,
      isNodePositionSet: computed,
      selectNode: action,
      setNodePositions: action,
    });
  }

  get getNodePositions() {
    return JSON.parse(JSON.stringify(this.nodePositions));
  }

  get isNodePositionSet() {
    return this.nodePositions.nodes.length > 0 && this.nodePositions.links.length > 0;
  }

  selectNode(node:string) {
    let a = this.provenance.addAction(`Selecting ${node}`, (state: ApplicationState) => {
      state.selectedNode = state.selectedNode === node ? 'none' : node;
      return state;
    });

    a.applyAction();
  }

  setNodePositions(pos: NodeMap, skipProvenance: boolean = false) {
    if (skipProvenance) {
      this.nodePositions = JSON.parse(JSON.stringify(pos));
      return;
    }
    let a = this.provenance.addAction('Setting node positions', (state: ApplicationState) => {
      state.nodePositions = JSON.parse(JSON.stringify(pos));
      return state;
    });

    a.applyAction();
  }
}

export const store = new Store();
