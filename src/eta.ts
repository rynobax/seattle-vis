import { useEffect } from 'react';
import { Loc } from './useLocation';
import { Item } from './airtable';

interface Result {
  text: string;
  value: number;
}

interface Element {
  distance: Result;
  duration: Result;
}

interface Response {
  rows: {
    elements: Element[];
  }[];
}

const google = (window as any).google;
export const getETA = (origin: Loc, address: string) => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [address],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      },
      (res: Response, status: string) => {
        console.log({ res, status });
        if (status !== 'OK') return reject(new Error(`Got status ${status}`));
        const { rows } = res;
        if (rows.length === 0) return reject(new Error(`No rows`));
        const { elements } = rows[0];
        if (elements.length === 0) return reject(new Error(`No elements`));
        return resolve(elements[0]);
      }
    );
  });
};

export const useETA = (items: Item[], location: Loc) => {
  useEffect(() => {});
};
