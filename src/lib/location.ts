import { getDistance } from "geolib"
import { z } from "zod";
import type { TransactionData } from "./transaction";

export const GeolocationCoordinatesSchema = z.object({
  accuracy: z.number(),
  altitude: z.nullable(z.number()),
  altitudeAccuracy: z.nullable(z.number()),
  heading: z.nullable(z.number()),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.nullable(z.number()),
});
export type GeolocationCoordinates = z.infer<typeof GeolocationCoordinatesSchema>;

export const TransactionLocationDataSchema = z.object({
  coords: GeolocationCoordinatesSchema,
  category: z.string(),
  info: z.string(),
});
export const TransactionLocationSchema = z.object({
  coords: GeolocationCoordinatesSchema,
  category: z.string(),
  info: z.string(),
  id: z.number(),
});

export type TransactionLocationData = z.infer<typeof TransactionLocationDataSchema>;
export type TransactionLocation = z.infer<typeof TransactionLocationSchema>;

export function distanceInMeters(coords1: GeolocationCoordinates, coords2: GeolocationCoordinates): number {
  return getDistance(coords1, coords2);
}

export function findNearestLocationWithMinimumDistanceInMeters(knownLocations: TransactionLocation[],coords: GeolocationCoordinates, minimumDistance: number, category?:string): TransactionLocation|undefined {
  const result = findNearestLocation(knownLocations, coords, category);
  if (result!==undefined) {
    //console.log(`dist=${distanceInMeters(coords, result.coords)}`, coords, result.coords, result)
    if (distanceInMeters(coords, result.coords)<=minimumDistance) return result;
    else return undefined;
  }
  else {
    return result;
  }
}

export function findNearestLocation(knownLocations: TransactionLocation[],coords: GeolocationCoordinates, category?:string): TransactionLocation|undefined {
  const applicableLocations = knownLocations
    .filter(l=>category===undefined||l.category===category);

  if (applicableLocations.length===0) return undefined;
  else if (applicableLocations.length===1) return applicableLocations[0];
  else return applicableLocations
    .reduce((prev, curr)=>distanceInMeters(coords, prev.coords)<distanceInMeters(coords, curr.coords)?prev:curr)
}

export interface NewTransactionEvent {
  newTransaction: TransactionData;
  location: TransactionLocationData|undefined;
}

export function convertTransactionLocationFromData(data: TransactionLocationData[]): TransactionLocation[] {
  return data.map((d,index)=>{
    const l: TransactionLocation = {id: index, ...d};
    return l;
  });
}

export function convertTransactionLocationToData(data: TransactionLocation[]): TransactionLocationData[] {
  return data.map(d=>{
    const l: TransactionLocationData = {
      category: d.category,
      coords: d.coords,
      info: d.info,
    };
    return l;
  });
}
