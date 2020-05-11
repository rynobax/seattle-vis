import React, { useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import memo from 'lodash/memoize';
import { Item } from './airtable';
import { ETAS, SuccessfulETA, isSuccessfulETA } from './eta';

interface TableProps {
  items: Item[];
  etas: ETAS[];
  walking: boolean;
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

interface MergedItem extends Item {
  walkingDistanceText: string;
  walkingDurationVal: number;
  walkingDurationText: string;
  drivingDistanceText: string;
  drivingDurationText: string;
  address: string | null;
}

const getMerged = memo(
  (items: Item[], etas: ETAS[]) =>
    items.map<MergedItem>(item => {
      const eta = etas.find(e => e.id === item.id);
      let walkingDurationVal = 999999999;
      let walkingDistanceText = '';
      let walkingDurationText = '';
      let drivingDistanceText = '';
      let drivingDurationText = '';
      let address: string | null = null;
      if (eta) {
        const closest = eta.etas.reduce<SuccessfulETA | null>((p, c) => {
          if (isSuccessfulETA(c)) {
            if (!p) return c;
            if (c.walking.duration.value < p.walking.duration.value) return c;
            return p;
          }
          return p;
        }, null);
        if (closest) {
          walkingDistanceText = closest.walking.distance.text;
          walkingDurationVal = closest.walking.duration.value;
          walkingDurationText = closest.walking.duration.text;
          drivingDistanceText = closest.driving.distance.text;
          drivingDurationText = closest.driving.duration.text;
          address = closest.address;
        }
      }
      return {
        ...item,
        walkingDistanceText,
        walkingDurationVal,
        walkingDurationText,
        drivingDistanceText,
        drivingDurationText,
        address,
      };
    }),
  (items: Item[]) => items.map(item => item.id).join()
);

const Table: React.FC<TableProps> = ({ items, etas, walking }) => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [items.map(item => item.id).join()]);

  const merged = getMerged(items, etas);

  const sorted = merged.sort((a, b) => a.walkingDurationVal - b.walkingDurationVal);

  return (
    <>
      {sorted.map(item => {
        return (
          <TableRow key={item.id} item={item} walking={walking} />
        );
      })}
    </>
  );
};

interface TableRowProps {
  item: MergedItem;
  walking: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ item, walking }) => {
  const [expanded, setExpanded] = useState(false);
  const dist = walking ? item.walkingDistanceText : item.drivingDistanceText;
  const dur = walking ? item.walkingDurationText : item.drivingDurationText;
  return (
    <Row onClick={() => setExpanded(!expanded)}>
      <LHS>
        <Name>
          {item.name} (${item.cost || '?'})
        </Name>
        <Description>{clip(item.description, expanded)}</Description>
      </LHS>
      <RHS>
        <Distance>{dur}</Distance>
        <Duration>{dist ? `(${dist})` : ''}</Duration>
        {expanded && item.address && (
          <Link href={`https://maps.google.com/?q=${item.address}`} target="_blank">
            Google Maps
          </Link>
        )}
      </RHS>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100px;
`;

const Cell = styled.div<{ noPadding?: boolean }>`
  padding: ${p => (p.noPadding ? '0px' : '8px')};
`;

const LHS = styled(Cell)`
  width: 72%;
`;

const RHS = styled(Cell)`
  width: 28%;
  display: flex;
  flex-direction: column;
`;

const MAIN_TEXT_COLOR = 'hsla(240, 60%, 5%, 0.85)';

const Name = styled.div`
  font-weight: 700;
  color: ${MAIN_TEXT_COLOR};
`;

const Description = styled.div``;

const Distance = styled.div`
  font-weight: 700;
  color: ${MAIN_TEXT_COLOR};
`;

const Duration = styled.div`
  color: rgba(14, 30, 37, 0.65);
`;

const Link = styled.a`
  color: ${MAIN_TEXT_COLOR};
`;

export default Table;
