import React, {FC, useMemo, useState, useRef, useEffect} from 'react';
import styled from 'styled-components';
import data from '../InteractiveData/miserables.json';
import BarVisualization from './BarChart/BarVisualization';
import {inject, observer} from 'mobx-react';
import NodeLinkVisualization from './NodeLink/NodeLinkVisualization';
import {forceSimulation, forceLink, forceManyBody, forceCenter} from 'd3';
import {actions} from '../exportInteractive';
import Store from '../InteractiveInterfaces/Store.js';
import socket from '../../../sockioExport';
import { importUsernameFromLocalStorage } from '../../../../../excalidraw-app/data/localStorage';
interface OwnProps {
  store?: Store;
}

type Props = OwnProps;

const Visualization: FC<Props> = ({store}: Props) => {
  const {isNodePositionSet} = store!;
  // console.log(store);
  const graphString = JSON.stringify(data);

  const [dimension, setDimensions] = useState({height: 0, width: 0});

  const dimensionString = JSON.stringify(dimension);

  const visAppRef = useRef<HTMLDivElement>(null);

  const getCurrentTimeComponents = () => {
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数

    return [hours, minutes, seconds, milliseconds];
  }

  useEffect(() => {
    // 确保元素已经渲染
    if (visAppRef.current) {
      const rect = visAppRef.current.getBoundingClientRect();
      console.log('Component size and position:', visAppRef.current);
      console.log("rect", rect)
      const offsetLeft = rect.left;
      const offsetTop = rect.top;
      const clientHeight = rect.height;
      const clientWidth = rect.width;
      let adjustedLeft: Number;
      let adjustedTop: Number;
      let adjustedWidth: Number;
      let adjustedHeight: Number;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (viewportHeight < viewportWidth * 0.75) {
        const scaleRatio = 1200 / viewportHeight;
        const widthOfOneSide = (viewportWidth - viewportHeight / 0.75) / 2;
        adjustedLeft =  (offsetLeft - widthOfOneSide) * scaleRatio;
        adjustedTop = offsetTop * scaleRatio;
        adjustedHeight = clientHeight * scaleRatio;
        adjustedWidth = clientWidth * scaleRatio;
      } else {
        const scaleRatio = 1600 / viewportWidth;
        const heightOfOneSide = (viewportHeight - viewportWidth / 0.75) / 2;
        adjustedLeft =  offsetLeft * scaleRatio;
        adjustedTop = (offsetTop - heightOfOneSide) * scaleRatio;
        adjustedHeight = clientHeight * scaleRatio;
        adjustedWidth = clientWidth * scaleRatio;
      }
      const imageSizeInfo = [adjustedLeft, adjustedTop, adjustedWidth, adjustedHeight];
      const currentTime = getCurrentTimeComponents();
      const username = importUsernameFromLocalStorage();
      const imageInfo = {
        imageId: "LesMiserables",
        sizeInfo: imageSizeInfo,
        currentTime: currentTime,
        fileName: "InteractiveSize" + "_" + username
      };
      console.log(imageSizeInfo);
      // socket.emit('record_image_switch', imageInfo);
      // 这里可以获取到 top, right, bottom, left, width, height 等值
    }
  }, []); 

  const barData = useMemo(() => {
    const grph = JSON.parse(graphString);
    const bar = JSON.parse(graphString);

    const {height, width} = JSON.parse(dimensionString);

    const simulation = forceSimulation()
      .force('link', forceLink().id((d: any) => d.id))
      .force('charge', forceManyBody().strength(-100))
      .force('center', forceCenter(width / 2, height / 2));

    simulation.nodes(grph.nodes);
    (simulation as any).force('link').links(grph.links);

    for (let i = 0; i < 300; ++i) {
      simulation.tick();
    }

    if (height > 0 && width > 0) {
      if (!isNodePositionSet) {
        actions.setNodePositions({...grph});
      }
    }

    return bar;
  }, [graphString, dimensionString, isNodePositionSet]);

  return (
    <VisualizationDiv ref={visAppRef}>
      <VisPadding>
        <VisualizationBorder>
          <NodeLinkVisualization
            pushDimension={setDimensions}></NodeLinkVisualization>
        </VisualizationBorder>
      </VisPadding>
      <VisPadding>
        <VisualizationBorder>
          <BarVisualization data={barData}></BarVisualization>
        </VisualizationBorder>
      </VisPadding>
    </VisualizationDiv>
  );
};

export default inject('store')(observer(Visualization));

const VisualizationBorder = styled.div`
  height: 100%;
  width: 100%;
  border: 1px solid black;
`;

const VisPadding = styled.div`
  height: 100%;
  width: 100%;
  padding: 1em;
`;

const VisualizationDiv = styled.div`
  height: 100%;
  width: 100%;
  padding: 1em;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
