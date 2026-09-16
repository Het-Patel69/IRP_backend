import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";

import {
  login,
  logout,
  me,
  register,
} from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;