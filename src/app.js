import init, { RelateDb } from '../vendor/relate.js';
import { createTransitGraph } from './graph.js';
import { assets, destinations } from './network.js';

const destination = document.querySelector('#destination');
const availability = document.querySelector('#availability');
const assetControls = document.querySelector('#asset-controls');
const reset = document.querySelector('#reset');
const report = document.querySelector('#report');
const selectors = new Map();
const initialStates = { 'UN-02': 'outage', 'RV-01': 'open', 'CV-03': 'open' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderControls() {
  for (const { id, name } of destinations) {
    destination.add(new Option(name, id));
  }
  for (const { id, name, linked } of assets) {
    const row = element('div', null, 'asset');
    const label = element('label', name);
    const details = element('p', linked);
    const select = document.createElement('select');
    label.htmlFor = select.id = `asset-${id}`;
    select.add(new Option('In service', 'open'));
    select.add(new Option('Out of service', 'outage'));
    select.add(new Option('Status unconfirmed', 'unknown'));
    details.id = `asset-details-${id}`;
    select.setAttribute('aria-describedby', details.id);
    selectors.set(id, select);
    row.append(label, details, select);
    assetControls.append(row);
  }
}

function renderSteps(route) {
  const list = element('ol', null, 'steps');
  route.stops.forEach((name, index) => {
    const step = document.createElement('li');
    step.append(element('strong', name));
    if (index < route.guide.length) {
      step.append(element('span', `${route.segmentMinutes[index]} min`));
      step.append(element('p', route.guide[index]));
    }
    list.append(step);
  });
  return list;
}

function renderReport(graph) {
  const unavailable = Array.from(selectors, ([id, select]) => select.value === 'open' ? null : id)
    .filter(Boolean);
  try {
    const { baseline, current, recovery, blockedBy, addedMinutes } = graph.compare(destination.value, unavailable);
    const extra = addedMinutes > 0 ? `+${addedMinutes} min vs. all elevators in service` : 'Fastest step-free route';
    const summary = element('div', null, `summary${current ? '' : ' warning'}`);
    summary.append(element('strong', current ? `${current.minutes} min · Step-free` : 'No confirmed step-free route'));
    if (current) summary.append(element('span', extra));
    report.replaceChildren(summary);

    if (blockedBy.length) {
      const items = blockedBy.map((id) => {
        const asset = assets.find((candidate) => candidate.id === id);
        const note = selectors.get(id).value === 'outage' ? 'out of service' : 'status unconfirmed';
        return `${asset.name} (${note})`;
      });
      report.append(element('p', `The usual route depends on ${items.join(' and ')}.`, 'finding'));
    }
    if (current) report.append(renderSteps(current));
    if (!current && recovery) {
      const tasks = recovery.unavailableAssets.map((id) => {
        const assetName = assets.find((candidate) => candidate.id === id).name;
        return selectors.get(id).value === 'outage'
          ? `Restore the ${assetName}`
          : `Confirm that the ${assetName} is in service`;
      });
      const recoveryPlan = element('section', null, 'recovery');
      recoveryPlan.append(element('h3', 'What would restore access'));
      recoveryPlan.append(element('p', `A ${recovery.minutes}-minute route would become available with these changes.`));
      const taskList = document.createElement('ul');
      for (const task of tasks) taskList.append(element('li', task));
      recoveryPlan.append(taskList);
      report.append(recoveryPlan);
    }
    if (baseline && blockedBy.length) {
      const comparison = document.createElement('details');
      comparison.append(element('summary', `Compare the usual ${baseline.minutes}-minute route`));
      comparison.append(renderSteps(baseline));
      report.append(comparison);
    }
  } catch (error) {
    console.error(error);
    report.replaceChildren(element('p', 'The route calculation failed. Reload to reset the demo.'));
  } finally {
    report.setAttribute('aria-busy', 'false');
  }
}

function resetConditions() {
  destination.value = 'clinic';
  for (const [id, select] of selectors) select.value = initialStates[id];
}

try {
  renderControls();
  resetConditions();
  await init();
  const graph = createTransitGraph(new RelateDb());
  destination.disabled = availability.disabled = reset.disabled = false;
  destination.addEventListener('change', () => renderReport(graph));
  availability.addEventListener('change', () => renderReport(graph));
  reset.addEventListener('click', () => {
    resetConditions();
    renderReport(graph);
  });
  renderReport(graph);
} catch (error) {
  console.error(error);
  report.replaceChildren(element('p', 'The Relate route engine could not load. Reload the page to retry.'));
  report.setAttribute('aria-busy', 'false');
}
