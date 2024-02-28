import React, {FC, useState, useRef} from 'react';
import Visualization from './InteractiveComponent/Visualization';
import {observer, inject} from 'mobx-react';
import Store from './InteractiveInterfaces/Store';
import ClipboardJS from 'clipboard';
import styled from 'styled-components';
import {
  Header,
} from 'semantic-ui-react';

interface OwnProps {
  store?: Store;
}

type Props = OwnProps;

const InteractiveVisApp: FC<Props> = ({store}: Props) => {
  const {selectedNode} = store!;
  new ClipboardJS('.copy-clipboard');

  return (
    <VisualizationWrapper>
      <Header textAlign="center">Selected Node: {selectedNode}</Header>
    <Visualization />
  </VisualizationWrapper>
  );
};

export default inject('store')(observer(InteractiveVisApp));

// Styled component for the Visualization wrapper
const VisualizationWrapper = styled.div`
    width: 60%;  // 设置宽度为父容器的60%
    height: 70%; // 设置高度为父容器的70%
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;