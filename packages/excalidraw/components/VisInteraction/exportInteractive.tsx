import InteractiveVisApp from './InteractiveVisApp'; // 假设App组件在App.tsx中
import {store} from './InteractiveInterfaces/Store'; // 导入Store定义
import * as serviceWorker from './serviceWorker';
import { Provider } from 'mobx-react';
import styled from 'styled-components';
import {setupProvenance} from './Provenance';
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
}

// 可以选择导出一个函数，该函数接受配置参数并返回组件
export const ExportedInteractiveVis: React.FC<ExportedInteractiveVisProps> = ({ stateOfTools }) => {
  return (
      <FullScreenContainer
        style={{
          position: 'absolute', // 使用绝对定位
          width: '100%', // 占满整个宽度
          height: '100%', // 占满整个高度
          zIndex: stateOfTools === "selection" ? 3 : 1,
        }}>
          <Provider store={store}>
              <InteractiveVisApp />
          </Provider>
    </FullScreenContainer>
  )};

  serviceWorker.unregister();

