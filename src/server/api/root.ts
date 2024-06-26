// import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userInfoRouter } from "./routers/userInfo";
import { programInfoRouter } from "./routers/programInfo";
import { materialInfoRouter } from "./routers/materialInfo";
import { formInfoRouter } from "./routers/formInfo";
import { sendEmailCert } from "./routers/sendemaillCert";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  userInfo: userInfoRouter,
  programInfo: programInfoRouter,
  materialInfo: materialInfoRouter,
  formInfo: formInfoRouter,
  sendEmailCert: sendEmailCert,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
