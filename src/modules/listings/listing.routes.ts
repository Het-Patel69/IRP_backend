import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";

import {
  create,
  details,
  list,
  mine,
  remove,
  update,
} from "./listing.controller";

const router = Router();

router.get("/", list);

router.get(
  "/mine",
  requireAuth,
  mine,
);

router.get("/:id", details);

router.post(
  "/",
  requireAuth,
  create,
);

router.patch(
  "/:id",
  requireAuth,
  update,
);

router.delete(
  "/:id",
  requireAuth,
  remove,
);

export default router;