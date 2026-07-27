import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import uploadedFilesRouter from "./uploaded-files";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(uploadedFilesRouter);

export default router;
