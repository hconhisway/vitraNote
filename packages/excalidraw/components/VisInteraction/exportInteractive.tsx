import InteractiveVisApp from './InteractiveVisApp'; // 假设App组件在App.tsx中
import {store} from './InteractiveInterfaces/Store'; // 导入Store定义
import * as serviceWorker from './serviceWorker';
import { Provider } from 'mobx-react';
import styled from 'styled-components';
import {setupProvenance} from './Provenance';
import {useEffect, useRef} from "react";
import socket from '../../sockioExport';

import {
  AppProps,
  AppState,
  ExcalidrawProps,
  BinaryFiles,
  UIAppState,
  AppClassProperties,
} from "../../types";

export const {provenance, actions} = setupProvenance();

const FullScreenContainer = styled.div`
  position: absolute; // 使用绝对定位
  width: 100%; // 占满整个宽度
  height: 100%; // 占满整个高度
`;

// const StyledProvider = styled(Provider)`
//   width: 100%;
//   height: 100%;
// `;

interface ExportedInteractiveVisProps {
  stateOfTools: string;
  appState: AppState;
}

// 可以选择导出一个函数，该函数接受配置参数并返回组件
export const ExportedInteractiveVis: React.FC<ExportedInteractiveVisProps> = ({ stateOfTools,  appState}) => {

  // useEffect(() => {
  //   if (appState.InteractiveVisVisibility) {
  //     // initializeInteractiveContent();
  //     appState.InteractiveVisVisibility = !appState.InteractiveVisVisibility
  //   }
  //   socket.on('visibilityChanged', (data) => {

  //   });
  //   // 可选：在组件卸载或appState.InteractiveVisVisibility变为false之前执行的清理操作
  //   return () => {
  //     // 清理操作，例如移除事件监听器
  //   };
  // }, [appState.InteractiveVisVisibility]); // 依赖数组，只有当 appState.InteractiveVisVisibility 改变时才重新运行
  // let visibilityOfUs = false;
  // useEffect(() => {
  //   const handleVisStatusUpdated= (visibility: boolean) => {
  //     console.log(visibility)
  //     visibilityOfUs = visibility;
  //   };
  //   socket.on('visibilityChanged', handleVisStatusUpdated);
  //   return () => {
  //     socket.off('visibilityChanged', handleVisStatusUpdated);
  //   };
  // }, []);
  
  useEffect(() => {
    const handleStoreUpdated= (newstore: any) => {
      console.log(newstore.provenance.exportProvenanceGraph);
      store.selectNode(newstore.selectedNode);
      store.setNodePositions(newstore.nodePositions);
    };
    socket.on('store-update', handleStoreUpdated);
    return () => {
      socket.off('store-update', handleStoreUpdated);
    };
  }, []);

  return (
      <FullScreenContainer
        style={{
          opacity: appState.InteractiveVisVisibility ? '100' : '0',
          position: 'absolute', // 使用绝对定位
          width: '100%', // 占满整个宽度
          height: '100%', // 占满整个高度
          zIndex: stateOfTools === "selection" && appState.InteractiveVisVisibility ? 3 : 1,
        }}>
          <Provider store={store}>
              <InteractiveVisApp />
          </Provider>
    </FullScreenContainer>
  )};

  serviceWorker.unregister();

