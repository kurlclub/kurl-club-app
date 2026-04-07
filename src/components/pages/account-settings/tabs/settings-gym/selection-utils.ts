interface ResolveSettingsGymIdInput {
  localSettingsGymId?: number | null;
  globalGymId?: number | null;
  clubGymIds?: readonly number[] | null;
}

export const resolveSettingsGymId = ({
  localSettingsGymId = null,
  globalGymId = null,
  clubGymIds = [],
}: ResolveSettingsGymIdInput): number | null => {
  const normalizedClubGymIds = clubGymIds ?? [];

  if (localSettingsGymId !== null && localSettingsGymId !== undefined) {
    return localSettingsGymId;
  }

  if (globalGymId !== null && globalGymId !== undefined) {
    return globalGymId;
  }

  return normalizedClubGymIds[0] ?? null;
};

interface SyncSelectedSettingsGymIdInput {
  currentSelectedGymId?: number | null;
  nextGlobalGymId?: number | null;
  previousGlobalGymId?: number | null;
  availableGymIds?: readonly number[] | null;
}

export const syncSelectedSettingsGymId = ({
  currentSelectedGymId = null,
  nextGlobalGymId = null,
  previousGlobalGymId = null,
  availableGymIds = [],
}: SyncSelectedSettingsGymIdInput): number | null => {
  const normalizedAvailableGymIds = availableGymIds ?? [];

  if (nextGlobalGymId === null || nextGlobalGymId === undefined) {
    if (
      currentSelectedGymId !== null &&
      currentSelectedGymId !== undefined &&
      (normalizedAvailableGymIds.length === 0 ||
        normalizedAvailableGymIds.includes(currentSelectedGymId))
    ) {
      return currentSelectedGymId;
    }

    return normalizedAvailableGymIds[0] ?? null;
  }

  if (previousGlobalGymId !== nextGlobalGymId) {
    return nextGlobalGymId;
  }

  if (currentSelectedGymId === null || currentSelectedGymId === undefined) {
    return nextGlobalGymId;
  }

  if (
    normalizedAvailableGymIds.length > 0 &&
    !normalizedAvailableGymIds.includes(currentSelectedGymId)
  ) {
    return nextGlobalGymId;
  }

  return currentSelectedGymId;
};
