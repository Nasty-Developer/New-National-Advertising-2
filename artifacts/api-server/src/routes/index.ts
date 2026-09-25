import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import storageRouter from "./storage";
import productsRouter from "./products";
import requestsRouter from "./requests";
import catalogRouter from "./catalog";
import cmsRouter from "./cms";
import projectsRouter from "./projects";
<<<<<<< HEAD
import productCategoriesRouter from "./product-categories";
=======
>>>>>>> origin/main

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(storageRouter);
router.use(productsRouter);
<<<<<<< HEAD
router.use(productCategoriesRouter);
=======
>>>>>>> origin/main
router.use(requestsRouter);
router.use(catalogRouter);
router.use(cmsRouter);
router.use(projectsRouter);

export default router;
