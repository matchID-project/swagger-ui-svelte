import type { OpenAPIV3 } from "openapi-types";
import { swagger} from "./stores";

let swaggerLocal: OpenAPIV3.Document = null;

swagger.subscribe((v) => { swaggerLocal = v });

export const loadSwagger = async (swaggerUrl: string) => {
  const res = await fetch(swaggerUrl)
  swaggerLocal = await res.json()
  swagger.set(swaggerLocal)
}

export const getSchema = (refName: string) => {
  const division = refName.replace("#/", "").split("/")
  return swaggerLocal[division[0]][division[1]][division[2]]
}

