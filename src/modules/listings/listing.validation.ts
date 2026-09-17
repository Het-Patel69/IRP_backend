import {
  AllocationMode,
  ListingStatus,
} from "../../generated/prisma";

import { AppError } from "../../errors/AppError";

import type {
  CreateListingInput,
  UpdateListingInput,
} from "./listing.types";

function isValidDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function validateCreateListing(
  data: CreateListingInput,
) {
  if (!data.title?.trim()) {
    throw new AppError(
      "Listing title is required",
      400,
      "TITLE_REQUIRED",
    );
  }

  if (!data.description?.trim()) {
    throw new AppError(
      "Listing description is required",
      400,
      "DESCRIPTION_REQUIRED",
    );
  }

  if (
    !Object.values(AllocationMode).includes(
      data.allocationMode,
    )
  ) {
    throw new AppError(
      "Invalid allocation mode",
      400,
      "INVALID_ALLOCATION_MODE",
    );
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new AppError(
      "At least one food item is required",
      400,
      "ITEM_REQUIRED",
    );
  }

  for (const item of data.items) {
    if (!item.name?.trim()) {
      throw new AppError(
        "Food item name is required",
        400,
        "ITEM_NAME_REQUIRED",
      );
    }

    if (
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      throw new AppError(
        "Food item quantity must be greater than zero",
        400,
        "INVALID_QUANTITY",
      );
    }

    if (!item.unit?.trim()) {
      throw new AppError(
        "Food item unit is required",
        400,
        "UNIT_REQUIRED",
      );
    }
  }

  if (
    data.availableFrom &&
    !isValidDate(data.availableFrom)
  ) {
    throw new AppError(
      "Invalid availableFrom date",
      400,
      "INVALID_AVAILABLE_FROM",
    );
  }

  if (
    data.availableUntil &&
    !isValidDate(data.availableUntil)
  ) {
    throw new AppError(
      "Invalid availableUntil date",
      400,
      "INVALID_AVAILABLE_UNTIL",
    );
  }

  if (
    data.availableFrom &&
    data.availableUntil &&
    new Date(data.availableUntil) <=
      new Date(data.availableFrom)
  ) {
    throw new AppError(
      "availableUntil must be after availableFrom",
      400,
      "INVALID_AVAILABILITY_RANGE",
    );
  }
}

export function validateUpdateListing(
  data: UpdateListingInput,
) {
  if (
    data.title !== undefined &&
    !data.title.trim()
  ) {
    throw new AppError(
      "Listing title cannot be empty",
      400,
      "INVALID_TITLE",
    );
  }

  if (
    data.description !== undefined &&
    !data.description.trim()
  ) {
    throw new AppError(
      "Listing description cannot be empty",
      400,
      "INVALID_DESCRIPTION",
    );
  }

  if (
    data.allocationMode !== undefined &&
    !Object.values(AllocationMode).includes(
      data.allocationMode,
    )
  ) {
    throw new AppError(
      "Invalid allocation mode",
      400,
      "INVALID_ALLOCATION_MODE",
    );
  }

  if (
    data.status !== undefined &&
    !Object.values(ListingStatus).includes(
      data.status,
    )
  ) {
    throw new AppError(
      "Invalid listing status",
      400,
      "INVALID_LISTING_STATUS",
    );
  }
}