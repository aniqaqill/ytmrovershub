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
  image: z.string(),
  materials: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
  }))
});

const RegisterInput = z.object({
  programId: z.string(),
  volunteerId: z.string()
});

export const programInfoRouter = createTRPCRouter({
  getAllProgram: protectedProcedure.query(async () => {
    const programs = await prisma.program.findMany({
      include: {
        coordinator: true,
        form: true,
        materials : true
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
          coordinator: true,
          materials: {
            include: {
              aidMaterial: true
            }
          }
        }
      });
      return program;
    }),

  createProgram: protectedProcedure.input(ProgramInput).mutation(async ({ input }) => {
    // Start a transaction to ensure atomicity
    const program = await prisma.$transaction(async (prisma) => {
      const createdProgram = await prisma.program.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: new Date(input.startDate),
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          maxVolunteer: input.maxVolunteer,
          coordinatorId: input.coordinatorId,
          image: input.image,
        }
      });

      for (const material of input.materials) {
        // Update the aid material quantity
        await prisma.aidMaterial.update({
          where: { id: material.id },
          data: {
            quantity: {
              decrement: material.quantity
            }
          }
        });

        // Create the ProgramAidMaterial relationship
        await prisma.programAidMaterial.create({
          data: {
            programId: createdProgram.id,
            aidMaterialId: material.id,
            quantityUsed: material.quantity
          }
        });
      }

      return createdProgram;
    });

    return program;
  }),

  updateProgramById: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      startDate: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      coordinatorId: z.string(),
      location: z.string(),
      maxVolunteer: z.number(),
      image: z.string(),
      materials: z.array(z.object({
        id: z.string(),
        quantity: z.number(),
      }))
    }))
    .mutation(async ({ input }) => {
      // Start a transaction to ensure atomicity
      const program = await prisma.$transaction(async (prisma) => {
        const updatedProgram = await prisma.program.update({
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
            image: input.image,
          }
        });

        // First, remove existing material relationships
        await prisma.programAidMaterial.deleteMany({
          where: { programId: input.id }
        });

        for (const material of input.materials) {
          // Update the aid material quantity
          await prisma.aidMaterial.update({
            where: { id: material.id },
            data: {
              quantity: {
                decrement: material.quantity
              }
            }
          });

          // Create the new ProgramAidMaterial relationship
          await prisma.programAidMaterial.create({
            data: {
              programId: updatedProgram.id,
              aidMaterialId: material.id,
              quantityUsed: material.quantity
            }
          });
        }

        return updatedProgram;
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
