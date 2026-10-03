import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { isIP } from "node:net";

let database: Promise<{ v4: Buffer; v6: Buffer }> | undefined;
function loadDatabase() {
  database ??= Promise.all([4, 6].map(async family => brotliDecompressSync(await readFile(join(process.cwd(), ".geoip", `coarse-v${family}.bin.br`)))))
    .then(([v4, v6]) => ({ v4, v6 })).catch(error => { database = undefined; throw error; });
  return database;
}

function addressPrefix(ip: string, family: number) {
  if (family === 4) return ip.split(".").reduce((value, part) => (value << 8n) + BigInt(part), 0n);
  // Convert IPv4 tails before expanding compressed IPv6 notation.
  const normalized = ip.replace(/\d+\.\d+\.\d+\.\d+$/, value => {
    const parts = value.split(".").map(Number);
    return `${((parts[0] << 8) + parts[1]).toString(16)}:${((parts[2] << 8) + parts[3]).toString(16)}`;
  });
  const [left, right] = normalized.split("::");
  const head = left ? left.split(":") : [];
  const tail = right ? right.split(":") : [];
  const groups = right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail];
  return groups.slice(0, 4).reduce((value, part) => (value << 16n) + BigInt(`0x${part}`), 0n);
}

export async function lookupCoarseLocation(ip: string): Promise<{ country: string; region: string } | null> {
  const family = isIP(ip);
  if (!family) return null;
  const data = await loadDatabase();
  const buffer = family === 4 ? data.v4 : data.v6;
  const size = family === 4 ? 13 : 21;
  const address = addressPrefix(ip, family);
  let low = 0, high = buffer.length / size - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1, offset = middle * size;
    const start = family === 4 ? BigInt(buffer.readUInt32BE(offset)) : buffer.readBigUInt64BE(offset);
    const end = family === 4 ? BigInt(buffer.readUInt32BE(offset + 4)) : buffer.readBigUInt64BE(offset + 8);
    if (address < start) high = middle - 1;
    else if (address > end) low = middle + 1;
    else return {
      country: buffer.toString("ascii", offset + size - 5, offset + size - 3),
      region: buffer.toString("ascii", offset + size - 3, offset + size).replace(/\0/g, ""),
    };
  }
  return null;
}
