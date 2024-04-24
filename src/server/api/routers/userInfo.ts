import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userInfoRouter = createTRPCRouter({
    
        getAllUser: protectedProcedure.query(async () => {
            const users = await prisma.user.findMany();
            return users;
        }),

        getUserById: protectedProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                const user = await prisma.user.findUnique({
                    where: { id: input.id },
                });
                return user;
            }),

        updateUserById: protectedProcedure
            .input(z.object({ id: z.string(), name: z.string(),role: z.string(),email :z.string(), contactNumber: z.string()}))
            .mutation(async ({ input }) => {
                const user = await prisma.user.update({
                    where: { id: input.id },
                    data: { 
                        name: input.name ,
                        role: input.role,
                        email: input.email,
                        contactNumber : input.contactNumber
                    },
                });
                return user;
            }),
    });






