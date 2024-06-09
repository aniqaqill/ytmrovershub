import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formSchema = z.object({
  dateCompleted: z.date(),
  feedback: z.string(),
  images: z.array(z.string()),
  status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']),
  volunteerId: z.string(),
  programId: z.string(),
});

export const formInfoRouter = createTRPCRouter({

  //volunteer actions
  createForm: protectedProcedure
    .input(formSchema)
    .mutation(async ({ input }) => {
      const form = await prisma.form.create({
        data: input,
      });
      return form;
    }),

    getStatusEachProgramByVolunteer: protectedProcedure
    .input(z.object({ volunteerId: z.string(), programId: z.string() }))
    .query(async ({ input }) => {
      const form = await prisma.form.findFirst({
        where: {
          volunteerId: input.volunteerId,
          programId: input.programId,
        },
      });
      return form?.status ?? null;
    }),
  

  //by Form Itself
  getFormById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const form = await prisma.form.findUnique({
        where: { id: input.id },
        include: {
          program: true,
          user: true,
        },
      });
      return form;
    }),

  
  //coordinator actions
  updateFormStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']),
    }))
    .mutation(async ({ input }) => {
      const form = await prisma.form.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return form;
    }),

  getFormsByProgram: protectedProcedure
    .input(z.object({ programId: z.string() }))
    .query(async ({ input }) => {
      const forms = await prisma.form.findMany({
        where: { programId: input.programId },
        include: {
          user: true,
        },
      });
      return forms;
    }),


});
