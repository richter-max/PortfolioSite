// summarize-scan.mjs — turns the newest Attack Surface Scanner result
// (github.com/richter-max/attack-surface-scanner, schema v2) into the
// small, public summary the Off Track terminal shows.
//
//   node scripts/summarize-scan.mjs <scan-output-dir> <out.json>
//
// Only facts from the scan go into the summary. Header checks are derived
// from the absence of the HDR-* findings for the apex host, because the
// scanner records findings, not header values.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, out] = process.argv.slice(2);
if (!dir || !out) {
  console.error('usage: summarize-scan.mjs <scan-output-dir> <out.json>');
  process.exit(2);
}

const files = readdirSync(dir).filter((f) => /^scan_.*\.json$/.test(f)).sort();
if (!files.length) {
  console.error(`no scan_*.json in ${dir}`);
  process.exit(1);
}
const scan = JSON.parse(readFileSync(join(dir, files.at(-1)), 'utf8'));
if (scan.schema_version !== '2') console.warn(`unexpected schema ${scan.schema_version}`);

const apex = scan.assets.find((a) => a.hostname === scan.target_domain) ?? scan.assets[0];
const ids = new Set((apex?.findings ?? []).map((f) => f.id));
const HEADERS = [
  ['HDR-001', 'Strict-Transport-Security'],
  ['HDR-002', 'Content-Security-Policy'],
  ['HDR-003', 'X-Frame-Options'],
  ['HDR-004', 'X-Content-Type-Options'],
  ['HDR-005', 'Referrer-Policy'],
];
const expires = apex?.certificate_expires ? new Date(apex.certificate_expires) : null;
const finished = new Date(scan.finished_at ?? scan.started_at);

const summary = {
  scannedAt: finished.toISOString(),
  target: scan.target_domain,
  discovery: scan.discovery_source,
  hosts: scan.asset_count,
  resolved: scan.resolved_count,
  outOfScopeRejected: scan.out_of_scope_rejected,
  durationSeconds: scan.duration_seconds ? Math.round(scan.duration_seconds * 10) / 10 : null,
  apex: apex
    ? {
        https: apex.uses_https,
        redirectsToHttps: apex.redirects_to_https,
        httpReachable: apex.http_reachable,
        tls: apex.tls_versions,
        certificateDaysLeft: expires ? Math.floor((expires - finished) / 864e5) : null,
        headers: HEADERS.map(([id, name]) => ({ name, present: !ids.has(id) })),
        risk: apex.risk,
      }
    : null,
  findings: {
    high: scan.finding_summary?.high ?? 0,
    medium: scan.finding_summary?.medium ?? 0,
    low: scan.finding_summary?.low ?? 0,
  },
  warnings: scan.warnings ?? [],
};

writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
console.log(`wrote ${out}: ${summary.hosts} hosts, findings`, summary.findings);
