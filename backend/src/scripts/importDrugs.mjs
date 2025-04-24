import fetch from 'node-fetch';
import db from '../db/index.js';

const fetchAndStoreDrugs = async () => {
  const res = await fetch('https://rxnav.nlm.nih.gov/REST/displaynames.json');
  const data = await res.json();
  const drugNames = data.displayTermsList.term;

  for (const name of drugNames) {
    if (!name.includes('/') && !name.includes(',') && name.length < 100) {
      try {
        await db.query('INSERT INTO drugs (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
      } catch (err) {
        console.error(`Error inserting ${name}:`, err);
      }
    }
  }

  console.log('Drug import completed.');
  process.exit(0);
};

fetchAndStoreDrugs();
