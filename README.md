# StepFree Relay

An elevator outage can break an essential connection inside a station even when the train still runs. StepFree Relay lets someone planning a trip compare the usual step-free route against the current availability of the elevators along it. New York City's MTA describes how even a brief elevator outage can affect a trip. [MTA report](https://www.mta.info/document/128921)

The included network is fictional. It tests the routing behavior with known results and does not use live transit data.

## Run locally

Use Node.js 20 or later.

```sh
npm ci
npm test
npm run build
python -m http.server 8700 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8700` in a current browser. The engine and routing both run inside the tab. The static server only delivers the files.

## Try the demo

1. Start with the Union transfer elevator out of service. Civic Clinic takes 25 minutes through Riverside. Open the route comparison to see the 18-minute route that normally uses Union.
2. Mark Union as in service. The shorter route returns.
3. Reset to the Union outage, then mark Civic's street elevator as out of service or unconfirmed. The clinic has no confirmed step-free route. The recovery panel shows that restoring or confirming Civic alone would reopen the route through Riverside. Switch to East Library to see a journey that does not depend on the Civic elevator.

## How the graph works

Stops and station levels are Relate nodes. Each directed path segment stores the walking or travel time, instructions, whether it is step-free, and the elevator it requires, if applicable. Cypher enumerates candidate paths, removes those with stairs or unavailable elevators, and ranks the remainder by total travel time. The same query with every elevator available supplies the baseline. The app can then name the exact assets that invalidate the usual path.

If no route is confirmed, a separate query mode allows candidate step-free paths with unavailable elevators and ranks them by the fewest distinct elevators that need restoring or confirming. Estimated travel time breaks ties. The result is shown as a recovery plan.

The demo uses Relate's browser WebAssembly package, version 1.2.0. It does not require a model, credentials, external databases, or network calls after the static files load. The transit graph, app, and tests were built with coding assistance from OpenAI Codex. The synthetic data carries no live operational information.

[Relate](https://github.com/relatedb/relate) is distributed under the Apache 2.0 license. The applicable license is included in `third-party/relate-LICENSE.txt` and copied into the demo build with the engine.
