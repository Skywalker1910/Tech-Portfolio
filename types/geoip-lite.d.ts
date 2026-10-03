declare module "geoip-lite" {
  const geoip:{lookup(ip:string):{country:string;region:string}|null};
  export default geoip;
}
