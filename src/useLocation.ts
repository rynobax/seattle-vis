import React from 'react';

export interface Loc {
  lat: number;
  lng: number;
}

export const useGeoPosition = (updatePercent: () => void) => {
  const [position, setPosition] = React.useState<Loc | null>(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      positionUpdate => {
        const { latitude, longitude } = positionUpdate.coords;
        // setPosition({ lat: 47.6086751, lng: -122.3409637 });
        setPosition({ lat: 47.6086751, lng: -122.3409637 });
        console.log('Finished fetching location');
        updatePercent();
      },
      () => null
    );
  }, []);

  return position;
};
