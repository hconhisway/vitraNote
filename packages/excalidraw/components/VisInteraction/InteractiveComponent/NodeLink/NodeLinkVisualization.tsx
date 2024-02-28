import React, { FC, useState, useRef, useLayoutEffect, useEffect } from 'react';
import Store from '../../InteractiveInterfaces/Store';
import { inject, observer } from 'mobx-react';
import styled from 'styled-components';
import NodeLinkDetails from './NodeLinkDetails';

interface OwnProps {
  store?: Store;
  pushDimension: (dims: any) => void;
}

type Props = OwnProps;

const NodeLinkVisualization: FC<Props> = ({ pushDimension, store }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  // 使用useLayoutEffect来测量SVG元素尺寸
  useLayoutEffect(() => {
    if (svgRef.current) {
      const newDims = {
        height: svgRef.current.clientHeight,
        width: svgRef.current.clientWidth,
      };
      setDimensions(newDims); // 直接更新尺寸状态
    }
  }, []); // 依赖为空数组，意味着仅在组件挂载时执行

  // 使用useEffect来响应尺寸变化，并通知父组件
  useEffect(() => {
    pushDimension(dimensions); // 尺寸变化时通知父组件
  }, [dimensions]); // 依赖于dimensions状态，当状态变化时执行

  return (
    <SVG ref={svgRef}>
      <defs>
        <filter id="dropshadow" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
          <feOffset dx="2" dy="2" result="offsetblur"/> 
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/> 
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/> 
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <NodeLinkDetails
        height={dimensions.height}
        width={dimensions.width}
      ></NodeLinkDetails>
    </SVG>
  );
};

export default inject('store')(observer(NodeLinkVisualization));

const SVG = styled.svg`
  height: 100%;
  width: 100%;
`;
