import React from 'react';

export interface Loc {
  lat: number;
  lng: number;
}

export const useGeoPosition = () => {
  const [position, setPosition] = React.useState<Loc | null>(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      positionUpdate => {
        const { latitude, longitude } = positionUpdate.coords;
        // setPosition({ lat: latitude, lng: longitude });
        setPosition({ lat: 47.6090614, lng: -122.3408986 });
      },
      () => null
    );
  }, []);

  return position;
};
