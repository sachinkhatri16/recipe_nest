const REQUIRED_CHEF_PROFILE_FIELDS = [
  "displayName",
  "bio",
  "location",
  "specialty",
  "experience",
];

const normalizeValue = (value) => (typeof value === "string" ? value.trim() : "");

function getChefProfileCompletion(user) {
  const profile = user?.profile || {};
  const resolvedProfile = {
    displayName: normalizeValue(profile.displayName || user?.name),
    bio: normalizeValue(profile.bio),
    location: normalizeValue(profile.location),
    specialty: normalizeValue(profile.specialty),
    experience: normalizeValue(profile.experience),
  };

  const missingFields = REQUIRED_CHEF_PROFILE_FIELDS.filter(
    (field) => !resolvedProfile[field]
  );

  return {
    missingFields,
    isComplete: missingFields.length === 0,
  };
}

module.exports = {
  getChefProfileCompletion,
};
