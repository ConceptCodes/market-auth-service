import type { Optional } from "../../global"

declare module "express-serve-static-core" {
  interface Request {
    id: Optional<string>;
  }
}
