import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import uploadedFilesRouter from "./uploaded-files";
import relationshipsRouter from "./relationships";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(uploadedFilesRouter);
router.use(relationshipsRouter);
router.use(storageRouter);

export default router;
