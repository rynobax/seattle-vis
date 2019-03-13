import { useState, useEffect } from 'react';
const Airtable = require('airtable');

const apiKey = process.env.REACT_APP_AIRTABLE_KEY;
const baseID = process.env.REACT_APP_AIRTABLE_BASE;

const base = new Airtable({ apiKey }).base(baseID);

interface Record {
  fields: any;
}

interface Event {
  Activity: string;
  Description?: string;
  Cost?: number;
  Duration?: number;
  Location?: string;
}

interface Meal {
  Name: string;
  Cost?: number;
  Description?: string;
  Location?: string;
}

const getTableRecords = async (baseName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log(`Getting ${baseName} records!`);
    base(baseName)
      .select({ view: 'Grid view' })
      .eachPage((records: Record[]) => {
        // Default maxRecords is 100
        if (records.length > 95) alert('Tell Ryan that he needs to add pagination');
        resolve(records.map(r => r.fields));
      })
      .catch((err: Error) => reject(err));
  });
};

const getAirtableData = async () => {
  const [events, meals]: [Event[], Meal[]] = await Promise.all([
    getTableRecords('Events'),
    getTableRecords('Meals'),
  ]);
  return { events, meals };
};

export interface Item {
  name: string;
  description: string;
  location?: string;
  cost?: number;
  id: string;
}

interface Data {
  events: Item[];
  meals: Item[];
}

export const useAirtable = (updatePercent: (percent: number) => void) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    getAirtableData()
      .then(({ events, meals }) => {
        setData({
          events: events.map((e, i) => ({
            name: e.Activity,
            description: e.Description || '',
            location: e.Location,
            cost: e.Cost,
            id: `events-${i}`,
          })),
          meals: meals.map((e, i) => ({
            name: e.Name,
            description: e.Description || '',
            location: e.Location,
            cost: e.Cost,
            id: `meals-${i}`,
          })),
        });
        updatePercent(25);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  }, []);
  return { data, loading, error };
};
