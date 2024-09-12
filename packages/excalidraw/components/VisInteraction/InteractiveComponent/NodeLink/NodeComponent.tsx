import React, { useEffect, useRef, useState } from 'react';
import { select, selectAll } from 'd3';
import styled from 'styled-components';
import Store from '../../InteractiveInterfaces/Store';
import {inject, observer} from 'mobx-react';
import {actions} from '../../exportInteractive';

const Background = styled.rect`
  fill: #ffffff; // 你可以选择任何背景颜色
  opacity: 0.8; // 可选，根据你的设计需求调整透明度
  rx: 5;
  ry: 5;
  filter: url(#dropshadow);
`;

const convertIDtoClassForm = (str: string): string => {
    return str.replace('.', '_');
  };

// 定义Node组件的Props类型
interface NodeProps {
  node: any; // 你可以根据实际需要更具体地定义这个类型
  isSelected: boolean;
  colorScale: any; // 同样，根据实际使用的scale类型具体定义
  neighbourNodeIds: string[];
  store?: Store;
}

const NodeComponent: React.FC<NodeProps> = ({ node, isSelected, colorScale, neighbourNodeIds, store }) => {
  const {selectedNode} = store!;
  const textRef = useRef<SVGTextElement | null>(null);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0, x: 0, y: 0 });
  useEffect(() => {
    if (isSelected && textRef.current) {
      const bbox = textRef.current.getBBox();
      setBackgroundSize({
        width: bbox.width + 10, // 加上一些额外的宽度作为边距
        height: bbox.height + 4, // 加上一些额外的高度作为边距
        x: bbox.x - 5, // 将背景稍微向左移动，增加边距
        y: bbox.y - 2, // 将背景稍微向上移动，增加边距
      });
    }
  }, [isSelected]);

  return (
    <g>
      <circle
        className={`node ${convertIDtoClassForm(node.id)}`}
        cx={node.x}
        cy={node.y}
        r={node.id === selectedNode ? 12 : 8}
        fill={colorScale(node.group)}
        stroke={neighbourNodeIds.includes(node.id) ? '#000' : '#fff'}
        strokeWidth={neighbourNodeIds.includes(node.id) ? '2px' : '1.5px'}
        style={{ cursor: 'pointer' }}
        onMouseOver={() => {
          const curr = selectAll(`.${convertIDtoClassForm(node.id)}`);
          curr.attr('r', 12);
          curr.style('fill', 'blueviolet !important');
        }}
        onMouseLeave={() => {
          if (node.id !== selectedNode)
            select(`.${convertIDtoClassForm(node.id)}`).attr('r', 8);
        }}
      ></circle>
      {isSelected && (
        <>
          <Background
            x={backgroundSize.x}
            y={backgroundSize.y}
            width={backgroundSize.width}
            height={backgroundSize.height}
          />
          <text
            ref={textRef}
            x={node.x}
            y={node.y - 25}
            textAnchor="middle"
            style={{ fontSize: '20px', fontWeight: 'bold' }}
          >
            {node.id}
          </text>
        </>
      )}
    </g>
  );
};

export default inject('store')(observer(NodeComponent));
