import { Router } from "express";
import postsRoutes from "./posts";
import userRoutes from "./users";

const router = Router();

router.use(userRoutes);
router.use(postsRoutes);

export default router;
