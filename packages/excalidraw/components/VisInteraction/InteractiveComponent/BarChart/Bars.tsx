import React, {FC, useEffect, useMemo} from 'react';
import Store from '../../InteractiveInterfaces/Store';
import {inject, observer} from 'mobx-react';
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
  }, [xScale, yScale]);

  return (
    <>
      <g className="axes">
        <g transform={`translate(0, ${height})`} className="x-axis"></g>
        <g className="y-axis"></g>
      </g>
      <g className="bars">
      {data.map(({character, count}) => (
        <rect
          key={character}
          className={convertIDtoClassForm(character)}
          x={xScale(character)}
          y={yScale(count)}
          width={xScale.bandwidth()}
          height={height - yScale(count)}
          fill={selectedNode === character ? 'red' : 'steelblue'}
          onClick={() => actions.selectNode(character)}
          onMouseOver={(e) => {
            e.currentTarget.style.fill = 'blueviolet';
            // 如果你想增加边框宽度或改变边框颜色来突出显示，可以在这里添加
            e.currentTarget.setAttribute('stroke', 'yellow');
            e.currentTarget.setAttribute('stroke-width', '0');
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.fill = selectedNode === character ? 'red' : 'steelblue';
            // 恢复边框的默认样式
            e.currentTarget.setAttribute('stroke', 'none'); // 假设默认情况下没有边框
            e.currentTarget.setAttribute('stroke-width', '0');
          }}
          style={{ cursor: 'pointer' }} // 设置鼠标样式为指针，提升用户体验
        />
      ))}
      </g>
    </>
  );
};

export default inject('store')(observer(Bars));

// interface BarProps {
//   isSelected: boolean;
// }

// const Bar = styled('rect')<BarProps>`
//   fill: ${props => (props.isSelected ? 'red' : 'steelblue')};
//   &:hover {
//     fill: ${props => (props.isSelected ? 'red' : 'blueviolet')};
//   }
// `;
