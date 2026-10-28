import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(siteDirectory, '..');
export const releaseConfig = JSON.parse(fs.readFileSync(path.join(siteDirectory, 'release.json'), 'utf8'));
export const routeContract = JSON.parse(fs.readFileSync(path.join(projectRoot, 'docs/hanzifun-rebuild/contracts/routes.json'), 'utf8'));

function patternRegExp(pattern) {
  const parts = pattern.split(/\{[^/]+\}/g).map(part => part.replace(/[.*+?^$()|[\]\\]/g, '\\$&'));
  return new RegExp('^' + parts.join('[^/]+') + '$');
}

export function resolveRoutePolicy(routePath, release = releaseConfig) {
  let statusValue = release.routes?.[routePath];
  if (statusValue && typeof statusValue === 'object') statusValue = statusValue.status;
  if (!statusValue) {
    for (const [pattern, patternStatus] of Object.entries(release.patterns || {})) {
      if (patternRegExp(pattern).test(routePath)) {
        statusValue = typeof patternStatus === 'object' ? patternStatus.status : patternStatus;
        break;
      }
    }
  }
  const status = statusValue || release.defaultStatus;
  const policy = release.statusPolicies?.[status];
  if (!policy) throw new Error('Unknown release status for route ' + routePath + ': ' + status);
  return { status, indexing: policy.indexing, robots: policy.robots };
}

export function staticOutputPath(routePath) {
  if (routePath.includes('{') || routePath.includes('?')) return null;
  if (routePath === '/') return 'index.html';
  if (routePath.endsWith('/')) return routePath.slice(1) + 'index.html';
  return routePath.slice(1);
}

export function buildRouteManifest({ prototypePaths, characters = [], additionalCharacters = [], additionalPaths = [], contract = routeContract, release = releaseConfig }) {
  const uniquePrototypePaths = [...new Set(prototypePaths)];
  const expected = release.prototypePathCount;
  if (uniquePrototypePaths.length !== expected || prototypePaths.length !== expected) {
    throw new Error('Expected ' + expected + ' prototype paths; received ' + prototypePaths.length +
      ' (' + uniquePrototypePaths.length + ' unique)');
  }

  const records = new Map();
  const add = (routePath, source, details = {}) => {
    const policy = resolveRoutePolicy(routePath, release);
    const record = {
      path: routePath,
      output: staticOutputPath(routePath),
      status: policy.status,
      indexing: policy.indexing,
      robots: policy.robots,
      sources: [source],
      ...details
    };
    const existing = records.get(routePath);
    if (existing) {
      existing.sources = [...new Set([...existing.sources, source])];
      Object.assign(existing, details);
      return existing;
    }
    records.set(routePath, record);
    return record;
  };

  const prototype = uniquePrototypePaths.map(routePath =>
    add(routePath, routePath === '/zh/' ? 'legacy-compatibility' : 'prototype')
  );

  for (const [routePath, details] of Object.entries(contract.routes || {})) {
    const record = add(routePath, routePath.includes('{') ? 'contract-pattern' : 'route-contract');
    record.phase1 = details.phase1;
    if (details.note) record.note = details.note;
    if (details.redirectTo) {
      record.redirectTo = details.redirectTo;
      record.output = null;
    }
    record.pattern = routePath.includes('{');
  }

  for (const character of characters) {
    add('/dictionary/' + character + '/', 'core-character-manifest', {
      character,
      pattern: false
    });
  }

  for(const character of additionalCharacters) add('/dictionary/'+character+'/', 'hsk-supplemental-character-manifest', {character,pattern:false});
  for(const routePath of additionalPaths) add(routePath, 'hf07-fixed-practice-set');

  return {
    contractVersion: contract.contractVersion,
    releaseId: release.releaseId,
    prototypePathCount: prototype.length,
    prototypePaths: prototype,
    routes: [...records.values()]
  };
}
