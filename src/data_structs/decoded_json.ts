/**
 * @file Contains decoded JSON types.
 */

/** Decoded JSON primitive. */
export type DecodedJsonPrimitive = string | number | boolean | null;

/** Decoded JSON array. */
export type DecodedJsonArray = (
  | DecodedJsonPrimitive
  | DecodedJsonObject
  | DecodedJsonArray
)[];

/** Decoded JSON object. */
export interface DecodedJsonObject {
  [key: string]: DecodedJsonPrimitive | DecodedJsonArray | DecodedJsonObject;
}

/** Decoded JSON. */
export type DecodedJson =
  | DecodedJsonPrimitive
  | DecodedJsonArray
  | DecodedJsonObject;

export default DecodedJson;
