import {
  AllocationMode,
  ListingStatus,
} from "../../generated/prisma";

export interface CreateListingItemInput {
  name: string;
  quantity: number;
  unit: string;
  categoryId?: number;
  storageRequirementId?: number;
}

export interface CreateListingImageInput {
  url: string;
  sortOrder?: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  allocationMode: AllocationMode;
  availableFrom?: string;
  availableUntil?: string;
  pickupAddress?: string;

  items: CreateListingItemInput[];
  images?: CreateListingImageInput[];
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  allocationMode?: AllocationMode;
  status?: ListingStatus;
  availableFrom?: string | null;
  availableUntil?: string | null;
  pickupAddress?: string | null;
}

export interface ListingFilters {
  search?: string;
  categoryId?: number;
  allocationMode?: AllocationMode;
  status?: ListingStatus;
}