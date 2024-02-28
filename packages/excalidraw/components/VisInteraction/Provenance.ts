import {
  Provenance,
  isStateNode
} from '@visdesignlab/trrack';
import {
  ApplicationState,
  NodeMap
} from './InteractiveInterfaces/ApplicationState';

import {store} from './InteractiveInterfaces/Store';

interface AppProvenance {
  provenance: Provenance<ApplicationState, unknown, unknown>;
  actions: {
    goForward: () => void;
    goBack: () => void;
    selectNode: (node: string) => void;
    setNodePositions: (pos: NodeMap, skipProvenance?: boolean) => void;
  };
}

export function setupProvenance(): AppProvenance {
  const provenance = store.provenance;

  provenance.addGlobalObserver(() => {
    let isAtRoot = false;

    const currentNode = provenance.current();

    if (isStateNode(currentNode)) {
      isAtRoot = currentNode.parent === provenance.root().id;
    }

    store.isAtRoot = isAtRoot;
    store.isAtLatest = provenance.current().children.length === 0;
  });

  provenance.addObserver(['nodePositions'], (state?: ApplicationState) => {
    if (
      state &&
      JSON.stringify(store.nodePositions) !==
        JSON.stringify(state.nodePositions)
    ) {
      store.nodePositions = state.nodePositions;
    }
  });

  provenance.addObserver(['selectedNode'], (state?: ApplicationState) => {
    store.selectedNode = state ? state.selectedNode : store.selectedNode;
  });

  provenance.done();

  const goForward = () => {
    provenance.goForwardOneStep();
  };

  const goBack = () => {
    provenance.goBackOneStep();
  };

  const selectNode = (node:string) => {
    // console.log(node);
    store.selectNode(node);
    console.log(store);
  }

  const setNodePositions = (pos:NodeMap, skipProvenance: boolean = false) => {
    store.setNodePositions(pos, skipProvenance);
  }
  
  return {
    provenance,
    actions: {
      goBack,
      goForward,
      selectNode,
      setNodePositions,
    },
  };
}
