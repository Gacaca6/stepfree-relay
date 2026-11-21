import { links, stops } from './network.js';

export const routeQuery = `
MATCH path = (start:Stop)-[:STEP*1..6]->(finish:Stop)
WHERE start.id = $from AND finish.id = $to
  AND all(step IN relationships(path) WHERE step.stepFree)
WITH nodes(path) AS stops, relationships(path) AS segments
WITH [stop IN stops | stop.name] AS stops,
     [step IN segments | step.guide] AS guide,
     [step IN segments | step.asset] AS assets,
     [step IN segments | step.minutes] AS segmentMinutes,
     reduce(total = 0, step IN segments | total + step.minutes) AS minutes
WITH stops, guide, assets, segmentMinutes, minutes,
     reduce(missing = [], asset IN assets |
       CASE WHEN asset IN $unavailable AND NOT (asset IN missing)
            THEN missing + [asset] ELSE missing END) AS unavailableAssets
WHERE $allowRecovery OR size(unavailableAssets) = 0
RETURN stops, guide, assets, segmentMinutes, minutes, unavailableAssets
ORDER BY size(unavailableAssets), minutes, stops
LIMIT 1
`;

function execute(db, cypher, params) {
  const result = JSON.parse(db.execute(cypher, JSON.stringify(params)));
  if (result.error) {
    const message = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
    throw new Error(message);
  }
  return result.rows;
}

export function createTransitGraph(db) {
  for (const stop of stops) {
    execute(db, 'CREATE (:Stop {id: $id, name: $name}) RETURN 1 AS created', stop);
  }
  for (const [from, to, minutes, guide, asset, stepFree] of links) {
    execute(db, `
      MATCH (start:Stop {id: $from}), (finish:Stop {id: $to})
      CREATE (start)-[:STEP {minutes: $minutes, guide: $guide, asset: $asset, stepFree: $stepFree}]->(finish)
      RETURN 1 AS created
    `, { from, to, minutes, guide, asset, stepFree });
  }

  return {
    compare(to, unavailable) {
      const baseline = execute(db, routeQuery, { from: 'cedar', to, unavailable: [], allowRecovery: false })[0];
      const current = execute(db, routeQuery, { from: 'cedar', to, unavailable, allowRecovery: false })[0];
      const recovery = current ? undefined :
        execute(db, routeQuery, { from: 'cedar', to, unavailable, allowRecovery: true })[0];
      const blockedBy = [...new Set(baseline?.assets.filter((asset) => unavailable.includes(asset)))];

      return {
        baseline,
        current,
        recovery,
        blockedBy,
        addedMinutes: current && baseline ? current.minutes - baseline.minutes : null,
      };
    },
  };
}
