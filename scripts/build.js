import { cp, mkdir } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const dist = new URL('dist/', project);
const vendor = new URL('vendor/', dist);

await mkdir(vendor, { recursive: true });
for (const file of ['index.html', 'styles.css', 'src/app.js', 'src/graph.js', 'src/network.js']) {
  const target = new URL(file, dist);
  await mkdir(new URL('.', target), { recursive: true });
  await cp(new URL(file, project), target);
}

for (const file of ['relate.js', 'relate_bg.wasm', 'opfs.js', 'trap.js', 'snippets']) {
  await cp(new URL(`node_modules/@relate/relate-wasm/${file}`, project), new URL(file, vendor), { recursive: true });
}

await cp(new URL('third-party/relate-LICENSE.txt', project), new URL('LICENSE.txt', vendor));
console.log('Built StepFree Relay in dist.');
