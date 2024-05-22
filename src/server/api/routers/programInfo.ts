import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ProgramInput = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  maxVolunteer: z.number(),
  coordinatorId: z.string(),
  image: z.string()
});

const RegisterInput = z.object({
  programId: z.string(),
  volunteerId: z.string()
});

export const programInfoRouter = createTRPCRouter({
  getAllProgram: protectedProcedure.query(async () => {
    const programs = await prisma.program.findMany({
      include: {
        coordinator: true, // Include coordinator information
        form: true, // Include associated forms
        aidMaterial: true // Include associated aid materials
      }
    });
    return programs;
  }),

  getProgramById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const program = await prisma.program.findUnique({
        where: { id: input.id },
        include: {
          coordinator: true, // Include coordinator information
          aidMaterial: true // Include associated aid materials
        }
      });
      return program;
    }),

  createProgram: protectedProcedure.input(ProgramInput).mutation(async ({ input }) => {
    const program = await prisma.program.create({
      data: {
        name: input.name,
        description: input.description,
        startDate: new Date(input.startDate),
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        maxVolunteer: input.maxVolunteer,
        coordinatorId: input.coordinatorId, // Connect program with coordinator
        image : input.image 
    },
      include: {
        coordinator: true, // Include coordinator information
      }
    });
    return program;
  }),

  updateProgramById: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      startDate: z.string(),
      startTime  : z.string(),
      endTime: z.string(),
      coordinatorId: z.string(),
      location: z.string(),
      maxVolunteer: z.number(),
      image: z.string(),
    }))
    .mutation(async ({ input }) => {
      const program = await prisma.program.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          startDate: new Date(input.startDate),
          startTime: input.startTime,
          endTime: input.endTime,
          coordinatorId: input.coordinatorId,
          location: input.location,
          maxVolunteer: input.maxVolunteer,
          image: input.image
        },
        include: {
          coordinator: true, // Include coordinator information
          form: true, // Include associated forms
          aidMaterial: true // Include associated aid materials
        }
      });
      return program;
    }),

  deleteProgramById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const program = await prisma.program.delete({
        where: { id: input.id },
      });
      return program;
    }),

  registerVolunteer: protectedProcedure
    .input(RegisterInput)
    .mutation(async ({ input }) => {
      const registration = await prisma.volunteerProgram.create({
        data: {
          programId: input.programId,
          userId: input.volunteerId,
        },
      });
      return registration;
    }),

  getVolunteerPrograms: protectedProcedure
    .input(z.object({ volunteerId: z.string() }))
    .query(async ({ input }) => {
      const userWithPrograms = await prisma.user.findUnique({
        where: { id: input.volunteerId },
        include: {
          volunteerPrograms: {
            include: {
              program: true,
            }
          },
        },
      });

      if (!userWithPrograms) {
        return []; // Return an empty array if no user is found
      }

      const volunteerPrograms = userWithPrograms.volunteerPrograms.map(vp => vp.program);
      return volunteerPrograms;
    }),
});
