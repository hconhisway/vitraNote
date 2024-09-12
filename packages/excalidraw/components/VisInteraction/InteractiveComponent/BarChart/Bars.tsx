import React, {FC, useEffect, useMemo, useRef, useState} from 'react';
import Store from '../../InteractiveInterfaces/Store';
import {inject, observer} from 'mobx-react';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import {
  scaleLinear,
  scaleBand,
  min,
  max,
  select,
  axisBottom,
  axisLeft,
  selectAll,
} from 'd3';
import styled from 'styled-components';
import {actions} from '../../exportInteractive';
import {Popup, Header} from 'semantic-ui-react';

const Background = styled.rect`
  fill: #ffffff; // 你可以选择任何背景颜色
  opacity: 0.8; // 可选，根据你的设计需求调整透明度
  rx: 5;
  ry: 5;
  filter: url(#dropshadow);
`;
interface OwnProps {
  store?: Store;
  height: number;
  width: number;
  data: {character: string; count: number}[];
}

type Props = OwnProps;

const convertIDtoClassForm = (str: string): string => {
  return str.replace('.', '_');
};

const Bars: FC<Props> = ({store, width, height, data}: Props) => {
  const {selectedNode} = store!;

  const [xScale, yScale] = useMemo(() => {
    const counts = data.map(d => d.count);
    const [minCount, maxCount] = [min(counts) || 0, max(counts) || 0];

    const xScale = scaleBand()
      .domain(data.map(d => d.character))
      .range([0, width])
      .paddingInner(0.2)
      .paddingOuter(0.2);

    const yScale = scaleLinear()
      .domain([maxCount, minCount])
      .range([0, height])
      .nice();

    return [xScale, yScale];
  }, [height, width, data]);
  const textRef = useRef<SVGTextElement | null>(null);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0, x: 0, y: 0 });
  useEffect(() => {
    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

    select('.x-axis').call(xAxis as any);
    select('.y-axis').call(yAxis as any);

    select('.x-axis')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('dx', '-1em')
      .attr('class', (d: any) => {
        return `bar-text ${convertIDtoClassForm(d)}`;
      })
      .attr('dy', '-1em')
      .style('dominant-baseline', 'middle');

  }, [xScale, yScale, selectedNode]);

  return (
    <>
      <g className="axes">
        <g transform={`translate(0, ${height})`} className="x-axis"></g>
        <g className="y-axis"></g>
      </g>
      <g className="bars">
        {data.map(({ character, count }) => {
          const isSelected = selectedNode === character;
          const textOffset = 10; // 文本向右偏移量
          const textX = xScale(character)! + xScale.bandwidth() / 2 + textOffset;
          const textY = yScale(count) - 50;

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
            // console.log(textRef.current)
          }, [isSelected, character]);
          
          return (
            
            <g key={character} onClick={() => actions.selectNode(character)} >
              <Bar
                isselected={String(isSelected)}
                className={convertIDtoClassForm(character)}
                x={xScale(character)}
                y={yScale(count)}
                width={xScale.bandwidth()}
                height={height - yScale(count)}
              ></Bar>
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
                  x={xScale(character)! + xScale.bandwidth() / 2}
                  y={yScale(count) - 5}
                  textAnchor="middle"
                  style={{fontSize:'20px', fontWeight: 'bold'}}
                >
                  {character}
                </text>
                </>
              )}
            </g>
          );
        })}
      </g>
    </>
  );
};

export default inject('store')(observer(Bars));

interface BarProps {
  isselected: string;
}

const Bar = styled('rect')<BarProps>`
  fill: ${props => (JSON.parse(props.isselected) ? 'red' : 'steelblue')};
  &:hover {
    fill: ${props => (JSON.parse(props.isselected) ? 'red' : 'blueviolet')};
  }
`;
