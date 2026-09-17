import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  AllocationMode,
  ListingStatus,
} from "../../generated/prisma";

import { AppError } from "../../errors/AppError";

import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  getMyListings,
  updateListing,
} from "./listing.service";

import {
  validateCreateListing,
  validateUpdateListing,
} from "./listing.validation";

function getListingId(req: Request) {
  const listingId = Number(req.params.id);

  if (
    !Number.isInteger(listingId) ||
    listingId <= 0
  ) {
    throw new AppError(
      "Invalid listing ID",
      400,
      "INVALID_LISTING_ID",
    );
  }

  return listingId;
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const donorId =
      res.locals.userId as number;

    validateCreateListing(req.body);

    const listing = await createListing(
      donorId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message:
        "Listing created successfully",
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categoryId =
      req.query.categoryId !== undefined
        ? Number(req.query.categoryId)
        : undefined;

    const listings = await getListings({
      search:
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : undefined,

      categoryId:
        categoryId &&
        Number.isInteger(categoryId)
          ? categoryId
          : undefined,

      allocationMode:
        typeof req.query.allocationMode === "string"
          ? (req.query
              .allocationMode as AllocationMode)
          : undefined,

      status:
        typeof req.query.status === "string"
          ? (req.query
              .status as ListingStatus)
          : undefined,
    });

    return res.status(200).json({
      success: true,
      data: {
        listings,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function mine(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const donorId =
      res.locals.userId as number;

    const listings =
      await getMyListings(donorId);

    return res.status(200).json({
      success: true,
      data: {
        listings,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function details(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const listingId =
      getListingId(req);

    const listing =
      await getListingById(listingId);

    return res.status(200).json({
      success: true,
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const listingId =
      getListingId(req);

    const donorId =
      res.locals.userId as number;

    validateUpdateListing(req.body);

    const listing =
      await updateListing(
        listingId,
        donorId,
        req.body,
      );

    return res.status(200).json({
      success: true,
      message:
        "Listing updated successfully",
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const listingId =
      getListingId(req);

    const donorId =
      res.locals.userId as number;

    await deleteListing(
      listingId,
      donorId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Listing cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
}