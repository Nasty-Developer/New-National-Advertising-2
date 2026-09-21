import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import storageRouter from "./storage";
import productsRouter from "./products";
import requestsRouter from "./requests";
import catalogRouter from "./catalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(storageRouter);
router.use(productsRouter);
  router.use(requestsRouter);
  router.use(catalogRouter);

export default router;
