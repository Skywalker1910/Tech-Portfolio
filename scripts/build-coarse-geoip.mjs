import { readFile, mkdir, writeFile } from "node:fs/promises";
import { brotliCompressSync, constants } from "node:zlib";

// Derive only country/state ranges from the pinned GeoLite source dataset.
// City names, coordinates, time zones and metro codes never enter release data.
const source = "node_modules/geoip-lite/data";
const names = await readFile(`${source}/geoip-city-names.dat`);
await mkdir(".geoip", { recursive: true });
for (const family of [4, 6]) {
  const input = await readFile(`${source}/geoip-city${family === 6 ? "6" : ""}.dat`);
  const inputSize = family === 4 ? 24 : 48;
  const outputSize = family === 4 ? 13 : 21;
  const ranges = [];
  const tagAt = offset => {
    const location = input.readUInt32BE(offset + (family === 4 ? 8 : 32));
    return location === 0xffffffff ? Buffer.alloc(5) : names.subarray(location * 88, location * 88 + 5);
  };
  const append = (start, end, tag) => {
    if (!/^[A-Z]{2}$/.test(tag.subarray(0, 2).toString())) return;
    const previous = ranges.at(-1);
    if (previous && previous.end + 1n === start && previous.tag.equals(tag)) previous.end = end;
    else ranges.push({ start, end, tag });
  };
  if (family === 4) {
    for (let offset = 0; offset < input.length; offset += inputSize) {
      append(BigInt(input.readUInt32BE(offset)), BigInt(input.readUInt32BE(offset + 4)), tagAt(offset));
    }
  } else {
    // The provider resolves IPv6 by upper-64-bit ranges. Several source rows
    // share a prefix. Compile its exact search result across every boundary
    // before merging, so compaction cannot change which country/state wins.
    const boundaries = new Set();
    for (let offset = 0; offset < input.length; offset += inputSize) {
      boundaries.add(input.readBigUInt64BE(offset));
      boundaries.add(input.readBigUInt64BE(offset + 16) + 1n);
    }
    const ordered = [...boundaries].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    const lookupTag = value => {
      let low = 0, high = input.length / inputSize - 1;
      while (low <= high) {
        const middle = (low + high) >>> 1, offset = middle * inputSize;
        const start = input.readBigUInt64BE(offset), end = input.readBigUInt64BE(offset + 16);
        if (start <= value && value <= end) return tagAt(offset);
        if (low === high) return Buffer.alloc(5);
        if (low === high - 1) low = high;
        else if (start > value) high = middle;
        else low = middle;
      }
      return Buffer.alloc(5);
    };
    for (let i = 0; i < ordered.length - 1; i++) append(ordered[i], ordered[i + 1] - 1n, lookupTag(ordered[i]));
  }
  const output = Buffer.alloc(ranges.length * outputSize);
  ranges.forEach(({ start, end, tag }, index) => {
    const offset = index * outputSize;
    if (family === 4) {
      output.writeUInt32BE(Number(start), offset);
      output.writeUInt32BE(Number(end), offset + 4);
    } else {
      output.writeBigUInt64BE(start, offset);
      output.writeBigUInt64BE(end, offset + 8);
    }
    tag.copy(output, offset + outputSize - 5);
  });
  const compressed = brotliCompressSync(output, { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } });
  await writeFile(`.geoip/coarse-v${family}.bin.br`, compressed);
  console.log(`Coarse IPv${family}: ${ranges.length} ranges, ${compressed.length} compressed bytes`);
}
