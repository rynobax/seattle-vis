import React, { useState, useReducer } from 'react';
import styled from 'styled-components';
import memo from 'lodash/memoize';
import { Item } from './airtable';
import { ETA } from './eta';

interface TableProps {
  items: Item[];
  etas: ETA[];
}

const MAX_LEN = 100;
const clip = (str: string, toExpand: boolean) => {
  if (toExpand) return str;
  let wordLen = 0;
  const words: string[] = [];
  let stoppedEarlyText = '';
  str.split(' ').forEach(word => {
    if (wordLen + 1 + word.length < MAX_LEN) {
      wordLen += 1 + word.length;
      words.push(word);
    } else {
      stoppedEarlyText = '...';
    }
  });
  return words.join(' ') + stoppedEarlyText;
};

const getMerged = memo(
  (items: Item[], etas: ETA[]) =>
    items.map(item => {
      const eta = etas.find(e => e.id === item.id);
      let distanceVal = 999999999;
      let distanceText = '';
      if (eta && eta.walking.status === 'OK') {
        distanceText = eta.walking.distance.text;
        distanceVal = eta.walking.distance.value;
      }
      return {
        ...item,
        distanceText,
        distanceVal,
      };
    }),
  (items: Item[]) => items.map(item => item.id).join()
);

const Table: React.FC<TableProps> = ({ items, etas }) => {
  const merged = getMerged(items, etas);

  const sorted = merged.sort((a, b) => a.distanceVal - b.distanceVal);

  return (
    <>
      <Row>
        <SortButton>💵</SortButton>
        <SortButton>🚶‍</SortButton>
      </Row>
      {sorted.map(item => {
        const [expanded, setExpanded] = useState();
        return (
          <Row key={item.id} onClick={() => setExpanded(!expanded)}>
            <LHS>
              <Name>
                {item.name} (${item.cost || '?'})
              </Name>
              <Description>{clip(item.description, expanded)}</Description>
            </LHS>
            <RHS>{item.distanceText}</RHS>
          </Row>
        );
      })}
    </>
  );
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100px;
  border-bottom: 1px solid grey;
`;

const SortButton = styled.div`
  height: 75px;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Cell = styled.div`
  padding: 8px;
`;

const LHS = styled(Cell)`
  width: 72%;
`;

const RHS = styled(Cell)`
  width: 28%;
  border-left: 1px solid grey;
`;

const Name = styled.div`
  font-weight: 700;
`;

const Description = styled.div``;

export default Table;