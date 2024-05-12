import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ProgramInput = z.object({
    name: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    maxVolunteer: z.number(),
    coordinatorId: z.string()
});

export const programInfoRouter = createTRPCRouter({
    getAllProgram: protectedProcedure.query(async () => {
        const programs = await prisma.program.findMany({
            include: {
                user: true, // Include coordinator information
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
                    user: true, // Include coordinator information
                    // forms: true, // Include associated forms
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
                endDate: new Date(input.endDate),
                location: input.location,
                maxVolunteer: input.maxVolunteer,
                coordinatorId:  input.coordinatorId // Connect program with coordinator
            },
            include: {
                user: true, // Include coordinator information
                // form: true, // Include associated forms
                // aidMaterial: true // Include associated aid materials
            }
        });
        return program;
    }),

    updateProgramById: protectedProcedure
        .input(z.object({ id: z.string(), name: z.string(), startDate: z.string(), endDate: z.string(), coordinatorId: z.string(), location: z.string(), maxVolunteer : z.number() })) // Added coordinatorId to update
        .mutation(async ({ input }) => {
            const program = await prisma.program.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    startDate: new Date(input.startDate),
                    endDate: new Date(input.endDate),
                    coordinatorId:  input.coordinatorId ,
                    location : input.location,
                    maxVolunteer: input.maxVolunteer
                },
                include: {
                    user: true, // Include coordinator information
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
});
