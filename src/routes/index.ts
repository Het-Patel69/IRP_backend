import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import listingRoutes from "../modules/listings/listing.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);

export default router;