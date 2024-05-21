import {z} from "zod";
import { createTRPCRouter,publicProcedure } from "~/server/api/trpc";
import { PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import  s3Client  from "~/server/storage/s3";


export const s3Router = createTRPCRouter({

    getStandardUploadPresignedUrl: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const { key } = input;
      const putObjectCommand = new PutObjectCommand({
        Bucket: "program_media",
        Key: key,
        ContentType: "image/jpeg",
      });
      await s3Client.send(putObjectCommand);
      return key;
    }),
    
    getImagebyProgramId: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const { key } = input;

      const command = new GetObjectCommand({
        Bucket: "program_media",
        Key: key,
      });
      
      const response = await s3Client.send(command);
      return response;
    }),
});