import React, {FC, useEffect, useRef, useState} from 'react';
import Store from '../../InteractiveInterfaces/Store';
import {actions} from '../../exportInteractive';
import * as d3 from 'd3';
import {inject, observer} from 'mobx-react';
import {select, scaleOrdinal, schemeCategory10, drag, selectAll} from 'd3';
import styled from 'styled-components';
import {Popup, Header} from 'semantic-ui-react';
import NodeComponent from './NodeComponent';

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
}

type Props = OwnProps;

const convertIDtoClassForm = (str: string): string => {
  return str.replace('.', '_');
};

const NodeLinkDetails: FC<Props> = ({store, height, width}: Props) => {
  const {getNodePositions, isNodePositionSet, selectedNode} = store!;

  let {nodes, links} = getNodePositions;

  const neighbourNodeIds: string[] = [];

  const selNode = nodes.find((d: any) => d.id === selectedNode);

  if (selNode) {
    links.forEach((link: any) => {
      if (link.source.id === selectedNode) {
        neighbourNodeIds.push(link.target.id);
      }
      if (link.target.id === selectedNode) {
        neighbourNodeIds.push(link.source.id);
      }
    });
  }

  if (isNodePositionSet) {
    if (JSON.stringify(nodes) !== JSON.stringify(getNodePositions.nodes)) {
      nodes = getNodePositions.nodes;
      links = getNodePositions.links;
    }
  }

  const colorScale = scaleOrdinal(schemeCategory10);
  const textRef = useRef<SVGTextElement | null>(null);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0, x: 0, y: 0 });
  useEffect(() => {
    nodes.forEach((node: any) => {
      const nodeId = convertIDtoClassForm(node.id);
      const curr = select('.nodes').select(`.${nodeId}`);
      const sourceLinks = select('.links').selectAll(`.S_${nodeId}`);
      const targetLinks = select('.links').selectAll(`.T_${nodeId}`);

      curr.on('click', () => {
        actions.selectNode(node.id);
      });

      (curr as any).call(
        drag()
          .on('drag', (event) => {
            curr.attr('cx', event.x);
            curr.attr('cy', event.y);

            sourceLinks.attr('x1', event.x);
            sourceLinks.attr('y1', event.y);

            targetLinks.attr('x2', event.x);
            targetLinks.attr('y2', event.y);
          })
          .on('end', (event) => {
            node.x = event.x;
            node.y = event.y;

            links.forEach((link: any) => {
              if (link.source.id === node.id) {
                link.source = node;
              }
              if (link.target.id === node.id) {
                link.target = node;
              }
            });

            actions.setNodePositions({nodes, links});
          }),
      );
    });
  }, [nodes, links]);

  return (
    <>
      <g className="links">
        {links.map((link: any) => (
          <Link
            className={`link S_${convertIDtoClassForm(
              link.source.id,
            )} T_${convertIDtoClassForm(link.target.id)}`}
            key={link.index}
            x1={link.source.x}
            x2={link.target.x}
            y1={link.source.y}
            y2={link.target.y}></Link>
        ))}
      </g>
      <g className="nodes">
      {nodes.map((node: any) => (
        <NodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          // actions={actions}
          colorScale={colorScale}
          neighbourNodeIds={neighbourNodeIds}
        />
      ))}
    </g>
    </>
  );
};

export default inject('store')(observer(NodeLinkDetails));

interface NodeProps {
  isneighbour: boolean;
}

const Node = styled.circle<NodeProps>`
  stroke-width: ${props => (props.isneighbour ? '2px' : '1.5px')};
  stroke: ${props => (props.isneighbour ? '#000' : ' #fff')};
`;

const Link = styled.line`
  stroke-width: 2px;
  stroke: #ccc;
`;
