import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import geoip from "geoip-lite";
import { lookupCoarseLocation } from "../lib/coarse-geoip";

test("compact country/state data matches the pinned provider across IPv4 and IPv6 ranges", async () => {
  const samples = ["8.8.8.8", "1.1.1.1", "81.2.69.142", "2001:4860:4860::8888", "2606:4700::1111", "::1"];
  let seed = 12345;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let i = 0; i < 512; i++) {
    const ip = next();
    samples.push(`${ip >>> 24}.${(ip >>> 16) & 255}.${(ip >>> 8) & 255}.${ip & 255}`);
  }
  const v6 = await readFile("node_modules/geoip-lite/data/geoip-city6.dat");
  for (let i = 0; i < 256; i++) {
    const offset = (next() % (v6.length / 48)) * 48;
    const groups = Array.from({ length: 8 }, (_, index) => v6.readUInt16BE(offset + index * 2).toString(16));
    samples.push(groups.join(":"));
  }
  for (const ip of samples) {
    const expected = geoip.lookup(ip);
    const actual = await lookupCoarseLocation(ip);
    assert.deepEqual(actual, expected?.country ? { country: expected.country, region: expected.region } : null, ip);
    if (actual) assert.deepEqual(Object.keys(actual).sort(), ["country", "region"]);
  }
  assert.equal(await lookupCoarseLocation("invalid"), null);
});

test("compressed release geography stays below eight megabytes", async () => {
  const files = await Promise.all([4, 6].map(family => readFile(`.geoip/coarse-v${family}.bin.br`)));
  assert.ok(files.reduce((size, file) => size + file.length, 0) < 8_000_000);
});
