export const stops = [
  { id: 'cedar', name: 'Cedar Market', type: 'Street' },
  { id: 'cedar-platform', name: 'Cedar platform', type: 'Station' },
  { id: 'union-upper', name: 'Union · upper platform', type: 'Station' },
  { id: 'union-lower', name: 'Union · lower platform', type: 'Station' },
  { id: 'river-arrival', name: 'Riverside · arrival', type: 'Station' },
  { id: 'river-transfer', name: 'Riverside · transfer', type: 'Station' },
  { id: 'civic-platform', name: 'Civic platform', type: 'Station' },
  { id: 'clinic', name: 'Civic Clinic', type: 'Street' },
  { id: 'library', name: 'East Library', type: 'Street' },
];

export const assets = [
  { id: 'UN-02', name: 'Union transfer elevator', place: 'Union Station', linked: 'Connects the upper and lower platforms' },
  { id: 'RV-01', name: 'Riverside transfer elevator', place: 'Riverside Station', linked: 'Connects the arrival and transfer platforms' },
  { id: 'CV-03', name: 'Civic street elevator', place: 'Civic Station', linked: 'Connects the platform to Civic Clinic' },
];

// [from, to, minutes, instructions, asset, step-free]
export const links = [
  ['cedar', 'cedar-platform', 2, 'Follow the sloped station entrance.', '', true],
  ['cedar-platform', 'union-upper', 5, 'Take the Green Line to Union.', '', true],
  ['union-upper', 'union-lower', 2, 'Transfer using the Union elevator.', 'UN-02', true],
  ['union-upper', 'union-lower', 1, 'Use the transfer stairs.', '', false],
  ['union-lower', 'civic-platform', 6, 'Take the Blue Line to Civic.', '', true],
  ['cedar-platform', 'river-arrival', 10, 'Stay on the Green Line to Riverside.', '', true],
  ['river-arrival', 'river-transfer', 3, 'Transfer using the Riverside elevator.', 'RV-01', true],
  ['river-transfer', 'civic-platform', 7, 'Take the Blue Line to Civic.', '', true],
  ['civic-platform', 'clinic', 3, 'Exit to street level using the Civic elevator.', 'CV-03', true],
  ['civic-platform', 'clinic', 1, 'Exit via the station stairs.', '', false],
  ['union-lower', 'library', 5, 'Take the step-free north ramp to the library.', '', true],
  ['river-transfer', 'library', 12, 'Follow the level canal path to the library.', '', true],
];

export const destinations = stops.filter(({ id }) => id === 'clinic' || id === 'library');
