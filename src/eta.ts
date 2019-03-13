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

export function isSuccessfulETA(eta: ETA): eta is SuccessfulETA {
  return eta.driving.status === 'OK' && eta.walking.status === 'OK';
}

export interface SuccessfulETA {
  driving: SuccessfulElement;
  walking: SuccessfulElement;
}

export interface ETA {
  driving: Element;
  walking: Element;
}

export interface ETAS {
  id: string;
  etas: ETA[];
}

export const useETAS = (items: Item[], currentLoc: Loc | null, updatePercent: () => void) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ETAS[] | null>(null);
  const seperateMultipleLocs = items.filter(item => item.location).map(item => ({
    ...item,
    location: item.location ? item.location.split('\n') : [''],
  }));
  const chunks = chunk(seperateMultipleLocs, 25);
  useEffect(() => {
    setError(null);
    setLoading(true);
    if (!currentLoc || items.length === 0) return;
    Promise.all(
      chunks.map(async chunkOfItems => {
        const locs = chunkOfItems.map(item => item.location);
        const res = await Promise.all(
          locs.map(loc =>
            Promise.all([getETAs('DRIVING', currentLoc, loc), getETAs('WALKING', currentLoc, loc)])
          )
        );
        return res.map(([driving, walking]) =>
          driving.map((_, i) => ({ driving: driving[i], walking: walking[i] }))
        );
      })
    )
      .then(res => {
        const elements = flatten(res);
        const etas = elements.map((es, i) => {
          const orig = seperateMultipleLocs[i];
          return {
            id: orig.id,
            etas: es.map(e => ({
              driving: e.driving,
              walking: e.walking,
            })),
          };
        });
        console.log('Finished fetching etas');
        updatePercent();
        setData(etas);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [items.length, currentLoc]);
  return { data, loading, error };
};
