import React from 'react';

export interface Loc {
  lat: number;
  lng: number;
}

export const useGeoPosition = () => {
  const [position, setPosition] = React.useState<Loc | null>(null);

  React.useEffect(() => {
    const listener = navigator.geolocation.watchPosition(
      positionUpdate => {
        const { latitude, longitude } = positionUpdate.coords;
        setPosition({ lat: latitude, lng: longitude });
      },
      () => null
    );

    return () => navigator.geolocation.clearWatch(listener);
  }, []);

  return position;
};
