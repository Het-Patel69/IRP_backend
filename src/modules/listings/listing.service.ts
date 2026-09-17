import {
  ListingStatus,
} from "../../generated/prisma";

import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

import type {
  CreateListingInput,
  ListingFilters,
  UpdateListingInput,
} from "./listing.types";

const listingInclude = {
  donor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },

  items: {
    where: {
      deletedAt: null,
    },

    include: {
      category: true,
      storageRequirement: true,
    },
  },

  images: {
    where: {
      deletedAt: null,
    },

    orderBy: {
      sortOrder: "asc" as const,
    },
  },
};

export async function createListing(
  donorId: number,
  data: CreateListingInput,
) {
  const listing = await prisma.listing.create({
    data: {
      donorId,

      title: data.title.trim(),

      description: data.description.trim(),

      allocationMode: data.allocationMode,

      availableFrom: data.availableFrom
        ? new Date(data.availableFrom)
        : null,

      availableUntil: data.availableUntil
        ? new Date(data.availableUntil)
        : null,

      pickupAddress:
        data.pickupAddress?.trim() || null,

      items: {
        create: data.items.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity,
          unit: item.unit.trim(),

          categoryId:
            item.categoryId ?? null,

          storageRequirementId:
            item.storageRequirementId ?? null,
        })),
      },

      images: data.images
        ? {
            create: data.images.map(
              (image, index) => ({
                url: image.url.trim(),

                sortOrder:
                  image.sortOrder ?? index,
              }),
            ),
          }
        : undefined,
    },

    include: listingInclude,
  });

  return listing;
}

export async function getListings(
  filters: ListingFilters,
) {
  return prisma.listing.findMany({
    where: {
      deletedAt: null,

      status:
        filters.status ??
        ListingStatus.OPEN,

      ...(filters.allocationMode && {
        allocationMode:
          filters.allocationMode,
      }),

      ...(filters.categoryId && {
        items: {
          some: {
            categoryId:
              filters.categoryId,

            deletedAt: null,
          },
        },
      }),

      ...(filters.search && {
        OR: [
          {
            title: {
              contains: filters.search,
            },
          },

          {
            description: {
              contains: filters.search,
            },
          },

          {
            items: {
              some: {
                name: {
                  contains:
                    filters.search,
                },

                deletedAt: null,
              },
            },
          },
        ],
      }),
    },

    include: listingInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMyListings(
  donorId: number,
) {
  return prisma.listing.findMany({
    where: {
      donorId,
      deletedAt: null,
    },

    include: listingInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getListingById(
  listingId: number,
) {
  const listing =
    await prisma.listing.findFirst({
      where: {
        id: listingId,
        deletedAt: null,
      },

      include: listingInclude,
    });

  if (!listing) {
    throw new AppError(
      "Listing not found",
      404,
      "LISTING_NOT_FOUND",
    );
  }

  return listing;
}

export async function updateListing(
  listingId: number,
  donorId: number,
  data: UpdateListingInput,
) {
  const existing =
    await prisma.listing.findFirst({
      where: {
        id: listingId,
        donorId,
        deletedAt: null,
      },
    });

  if (!existing) {
    throw new AppError(
      "Listing not found or you do not have permission to edit it",
      404,
      "LISTING_NOT_FOUND",
    );
  }

  return prisma.listing.update({
    where: {
      id: listingId,
    },

    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.description !== undefined && {
        description:
          data.description.trim(),
      }),

      ...(data.allocationMode !== undefined && {
        allocationMode:
          data.allocationMode,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.availableFrom !== undefined && {
        availableFrom:
          data.availableFrom
            ? new Date(
                data.availableFrom,
              )
            : null,
      }),

      ...(data.availableUntil !== undefined && {
        availableUntil:
          data.availableUntil
            ? new Date(
                data.availableUntil,
              )
            : null,
      }),

      ...(data.pickupAddress !== undefined && {
        pickupAddress:
          data.pickupAddress?.trim() ||
          null,
      }),
    },

    include: listingInclude,
  });
}

export async function deleteListing(
  listingId: number,
  donorId: number,
) {
  const existing =
    await prisma.listing.findFirst({
      where: {
        id: listingId,
        donorId,
        deletedAt: null,
      },
    });

  if (!existing) {
    throw new AppError(
      "Listing not found or you do not have permission to delete it",
      404,
      "LISTING_NOT_FOUND",
    );
  }

  await prisma.listing.update({
    where: {
      id: listingId,
    },

    data: {
      status: ListingStatus.CANCELLED,
      deletedAt: new Date(),
    },
  });
}