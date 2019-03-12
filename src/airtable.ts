import React, { useState, useEffect } from 'react';
const Airtable = require('airtable');

const apiKey = process.env.REACT_APP_AIRTABLE_KEY;
const baseID = process.env.REACT_APP_AIRTABLE_BASE;

const base = new Airtable({ apiKey }).base(baseID);

interface Record {
  get: (name: string) => any;
}

const getTableRecords = async (baseName: string) => {
  return new Promise((resolve, reject) => {
    base(baseName)
      .select({ view: 'Grid view' })
      .eachPage((records: Record[]) => {
        // Default maxRecords is 100
        if (records.length > 95) alert('Tell Ryan that he needs to add pagination');
        console.log(records);
        // addressToLatLng(records[0].get('Location'));
        // records.forEach(async record => {
        //   const address = record.get('Location');
        //   const name = record.get('Activity');
        //   const pos = await addressToLatLng(address);
        //   if (pos) {
        //     // Add to map
        //     console.log(pos);
        //     const marker = new google.maps.Marker({
        //       position: pos,
        //       map,
        //       title: name,
        //     });
        //   } else {
        //     // Note that its location does not work
        //     const div = document.createElement('div');
        //     div.innerText = name;
        //     noloc.appendChild(div);
        //   }
        // });
      });
  });
};

const getAirtableData = async () => {};

const useAirtable = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  useEffect(() => {
    // getAirtableData
  });
};

export default React;
