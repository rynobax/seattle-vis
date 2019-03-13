import { useEffect, useState } from 'react';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import { Loc } from './useLocation';
import { Item } from './airtable';

interface Result {
  text: string;
  value: number;
}

interface SuccessfulElement {
  distance: Result;
  duration: Result;
  status: 'OK';
}

interface FailedElement {
  status: 'NOT_FOUND';
}

type Element = SuccessfulElement | FailedElement;

interface Response {
  rows: {
    elements: Element[];
  }[];
}

type TravelMode = 'DRIVING' | 'WALKING';

const google = (window as any).google;
const getETAs = (
  travelMode: TravelMode,
  origin: Loc,
  addresses: Array<string | undefined>
): Promise<Element[]> => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: addresses,
        travelMode,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      },
      (res: Response, status: string) => {
        if (status !== 'OK') return reject(new Error(`Got status ${status}`));
        const { rows } = res;
        if (rows.length === 0) return reject(new Error(`No rows`));
        const { elements } = rows[0];
        return resolve(elements);
      }
    );
  });
};

export interface ETA {
  id: string;
  driving: Element;
  walking: Element;
}

export const useETA = (items: Item[], currentLoc: Loc | null) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ETA[] | null>(null);
  const [percent, setPercent] = useState(0);
  const withLoc = items.filter(item => item.location);
  const chunks = chunk(withLoc, 25);
  useEffect(() => {
    if(percent < 100) {
      setTimeout(() => {
        setPercent(percent + 10);
      }, 400);
    }
  }, [percent]);
  useEffect(() => {
    setError(null);
    setLoading(true);
    if (!currentLoc) return;
    // Promise.all(
    //   chunks.map(async chunkOfItems => {
    //     const locs = chunkOfItems.map(item => item.location);
    //     const [driving, walking] = await Promise.all([
    //       getETAs('DRIVING', currentLoc, locs),
    //       getETAs('WALKING', currentLoc, locs),
    //     ]);
    //     return driving.map((_, i) => ({ driving: driving[i], walking: walking[i] }));
    //   })
    // )
    //   .then(res => {
    //     const elements = flatten(res);
    //     const etas = elements.map((e, i) => {
    //       const orig = withLoc[i];
    //       return {
    //         id: orig.id,
    //         driving: e.driving,
    //         walking: e.walking,
    //       };
    //     });
    //     setData(etas);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError(err);
    //     setLoading(false);
    //   });
  }, [items.length, currentLoc]);
  return { data, loading, error, percent };
};
