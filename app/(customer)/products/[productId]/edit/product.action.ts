"use server";

import { ActionError, userAction } from "@/safe-actions";
import { ProductSchema } from "./product.schema";
import { prisma } from "@/prisma";
import { z } from "zod";

const verifySlugUniqueness = async (slug: string, productId?: string) => {
  const slugExists = await prisma.product.count({
    where: {
      slug: slug,
      id: productId
        ? {
          not: productId,
        }
        : undefined,
    },
  });

  if (slugExists) {
    throw new ActionError("Slug already exists");
  }
};

export const createProductAction = userAction(
  ProductSchema,
  async (input, context) => {
    const slugExists = await prisma.product.count({
      where: {
        slug: input.slug,
      },
    })
    if (slugExists > 0) {
      throw new ActionError("A product with this slug already exists");
    }
    const product = await prisma.product.create({
      data: {
        ...input,
        userId: context.user.id,
      }
    })
    return product
  })

export const updateProductAction = userAction(
  z.object({
    id: z.string(),
    data: ProductSchema,
  }),
  async (input, context) => {
    await verifySlugUniqueness(input.data.slug, input.id);

    const updatedProduct = await prisma.product.update({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      data: input.data,
    });

    return updatedProduct;
  }
);
export const deleteProductAction = userAction(
  z.string(),
  async (productId, context) => {
    await prisma.product.delete({
      where: {
        id: productId,
        userId: context.user.id,
      },
    });
  }
);