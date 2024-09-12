import {
  Provenance,
  isStateNode
} from '@visdesignlab/trrack';
import {
  ApplicationState,
  NodeMap
} from './InteractiveInterfaces/ApplicationState';

import {store} from './InteractiveInterfaces/Store';
import socket from '../../sockioExport';
import {useEffect} from "react";

interface AppProvenance {
  provenance: Provenance<ApplicationState, unknown, unknown>;
  actions: {
    goForward: () => void;
    goBack: () => void;
    selectNode: (node: string) => void;
    // selectNodeIO: (node: string) => void;
    setNodePositions: (pos: NodeMap, skipProvenance?: boolean) => void;
    // setNodePositionsIO: (pos: NodeMap, skipProvenance?: boolean) => void;
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

  const getCurrentTimeComponents = () => {
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数

    return [hours, minutes, seconds, milliseconds];
  }

  const selectNode = (node:string) => {
    // console.log(node);
    store.selectNode(node);
    const currentTime = getCurrentTimeComponents();
    const store_data = {currentTime: currentTime, store:store, fileName: "Userstudy010"};
    socket.emit('update-node', store_data);
    // console.log(store);
  }

  const setNodePositions = (pos:NodeMap, skipProvenance: boolean = false) => {
    store.setNodePositions(pos, skipProvenance);
    const currentTime = getCurrentTimeComponents();
    const store_data = {currentTime: currentTime, store:store, fileName: "Userstudy010"};
    socket.emit('update-node', store_data);
  }

  // const selectNodeIO = (node:string) => {
  //   // console.log(node);
  //   store.selectNode(node);
  //   // socket.emit('update-node', store);
  //   // console.log(store);
  // }

  // const setNodePositionsIO = (pos:NodeMap, skipProvenance: boolean = false) => {
  //   store.setNodePositions(pos, skipProvenance);
  //   // socket.emit('update-node', store);
  // }
    

  return {
    provenance,
    actions: {
      goBack,
      goForward,
      selectNode,
      // selectNodeIO,
      setNodePositions,
      // setNodePositionsIO,
    },
  };
}
