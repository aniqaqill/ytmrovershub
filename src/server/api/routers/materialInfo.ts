import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const aidMaterialSchema = z.object({
    name: z.string(),
    description: z.string(),
    quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
    image: z.string()
});

const idSchema = z.object({
    id: z.string()
});

export const materialInfoRouter = createTRPCRouter({
    getAllAidMaterial: protectedProcedure.query(async () => {
        try {
            const aidMaterials = await prisma.aidMaterial.findMany();
            return aidMaterials;
        } catch (error) {
            throw new Error('Failed to fetch aid materials');
        }
    }),

    createAidMaterial: protectedProcedure.input(aidMaterialSchema).mutation(async ({ input }) => {
        try {
            const aidMaterial = await prisma.aidMaterial.create({
                data: input
            });
            return aidMaterial;
        } catch (error) {
            throw new Error('Failed to create aid material');
        }
    }),

    deleteAidMaterialById: protectedProcedure.input(idSchema).mutation(async ({ input }) => {
        try {
            // Start a transaction
            await prisma.$transaction(async (prisma) => {
                // Delete related ProgramAidMaterial records
                await prisma.programAidMaterial.deleteMany({
                    where: { aidMaterialId: input.id }
                });

                // Delete the AidMaterial
                await prisma.aidMaterial.delete({
                    where: { id: input.id }
                });
            });

            return { success: true };
        } catch (error) {
            throw new Error('Failed to delete aid material');
        }
    }),

    updateAidMaterialById: protectedProcedure.input(aidMaterialSchema.merge(idSchema)).mutation(async ({ input }) => {
        try {
            const aidMaterial = await prisma.aidMaterial.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    quantity: input.quantity,
                    image: input.image
                }
            });
            return aidMaterial;
        } catch (error) {
            throw new Error('Failed to update aid material');
        }
    }),

    getAidMaterialById: protectedProcedure.input(idSchema).query(async ({ input }) => {
        try {
            const aidMaterial = await prisma.aidMaterial.findUnique({
                where: { id: input.id }
            });
            if (!aidMaterial) {
                throw new Error('Aid material not found');
            }
            return aidMaterial;
        } catch (error) {
            throw new Error('Failed to fetch aid material');
        }
    }),
});
