import { isIP } from "node:net";
import type { AnalyticsLocation } from "./analytics";

type CoarseLookup = (ip:string)=>{country?:string;region?:string}|null;
const emptyLocation:AnalyticsLocation={countryCode:null,country:null,region:null,regionCode:null};

export function publicViewerIp(headers:Headers) {
  const viewer=headers.get("cloudfront-viewer-address");
  let ip=viewer ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (viewer) ip=ip.startsWith("[") ? ip.slice(1,ip.indexOf("]")) : ip.replace(/:\d+$/,"");
  if (ip.startsWith("::ffff:")) ip=ip.slice(7);
  const family=isIP(ip);
  if (!family) return null;
  if (family===4) {
    const [a,b]=ip.split(".").map(Number);
    if (a===0 || a===10 || a===127 || a>=224 || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && b===168) || (a===100 && b>=64 && b<=127)) return null;
  } else if (ip==="::" || ip==="::1" || /^(fc|fd|fe[89ab]|ff)/i.test(ip)) return null;
  return ip;
}

// Only these four fields can leave the local resolver. No outbound GeoIP API.
export async function resolveAnalyticsLocation(headers:Headers, current:AnalyticsLocation=emptyLocation, lookup?:CoarseLookup):Promise<AnalyticsLocation> {
  if (current.countryCode && (current.region || current.regionCode)) return current;
  const ip=publicViewerIp(headers);
  if (!ip) return current;
  try {
    const localLookup=lookup ?? (await import("geoip-lite")).default.lookup;
    const result=localLookup(ip);
    const countryCode=result?.country && /^[A-Z]{2}$/.test(result.country) ? result.country : null;
    if (!countryCode || (current.countryCode && current.countryCode!==countryCode)) return current;
    const regionCode=result?.region && /^[A-Z0-9-]{1,12}$/.test(result.region) ? result.region : null;
    return {
      countryCode:current.countryCode ?? countryCode,
      country:current.country ?? new Intl.DisplayNames(["en"],{type:"region"}).of(countryCode) ?? countryCode,
      region:current.region,
      regionCode:current.regionCode ?? regionCode,
    };
  } catch {
    // Missing database coverage is represented as unknown, never a guessed city.
    return current;
  }
}
