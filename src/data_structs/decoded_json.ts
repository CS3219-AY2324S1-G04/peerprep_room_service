export type DecodedJsonPrimitive = string | number | boolean | null;

export type DecodedJsonArray = (
  | DecodedJsonPrimitive
  | DecodedJsonObject
  | DecodedJsonArray
)[];

export interface DecodedJsonObject {
  [key: string]: DecodedJsonPrimitive | DecodedJsonArray | DecodedJsonObject;
}

export type DecodedJson =
  | DecodedJsonPrimitive
  | DecodedJsonArray
  | DecodedJsonObject;

export default DecodedJson;
