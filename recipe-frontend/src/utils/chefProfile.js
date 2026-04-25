const REQUIRED_CHEF_PROFILE_FIELDS = [
  "displayName",
  "bio",
  "location",
  "specialty",
  "experience",
];

const normalizeValue = (value) => (typeof value === "string" ? value.trim() : "");

export function getChefProfileCompletion(profile = {}, user = {}) {
  const safeProfile = profile || {};
  const safeUser = user || {};
  const resolvedProfile = {
    displayName: normalizeValue(safeProfile.displayName || safeUser.name),
    bio: normalizeValue(safeProfile.bio),
    location: normalizeValue(safeProfile.location),
    specialty: normalizeValue(safeProfile.specialty),
    experience: normalizeValue(safeProfile.experience),
  };

  const missingFields = REQUIRED_CHEF_PROFILE_FIELDS.filter(
    (field) => !resolvedProfile[field]
  );

  return {
    missingFields,
    isComplete: missingFields.length === 0,
  };
}
