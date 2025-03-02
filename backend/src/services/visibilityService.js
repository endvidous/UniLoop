import { findTeacherDetails, findStudentDetails } from "./userService.js";

export const buildBaseQuery = (options = {}) => {
  const { includeExpiry = true } = options;
  return includeExpiry
    ? {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      }
    : {};
};

export const buildVisibilityQuery = async (
  user,
  modelType = "announcement"
) => {
  const baseQuery = buildBaseQuery({
    includeExpiry: modelType === "announcement",
  });

  if (user.isAdmin()) return baseQuery;

  let visibilityConditions = [{ visibilityType: "General" }];
  let associations;

  if (user.isTeacher()) {
    const associations = await findTeacherDetails(user._id);
    if (!associations) return { _id: null }; // Return empty set

    visibilityConditions.push(
      {
        visibilityType: "Department",
        "posted_to.id": associations.departmentId,
      },
      {
        visibilityType: "Course",
        "posted_to.id": { $in: associations.courseIds },
      },
      {
        visibilityType: "Batch",
        "posted_to.id": { $in: associations.batchIds },
      }
    );
  } else if (user.isStudent()) {
    associations = await findStudentDetails(user._id);
    if (!associations) return { _id: null };

    visibilityConditions.push(
      {
        visibilityType: "Department",
        "posted_to.id": { $in: associations.departmentIds },
      },
      { visibilityType: "Course", "posted_to.id": associations.courseId },
      { visibilityType: "Batch", "posted_to.id": associations.batchId }
    );
  } else {
    return { _id: null }; // Default for unrecognized roles
  }

  return { ...baseQuery, $or: visibilityConditions };
};

export const validatePosting = async (user, postData) => {
  if (user.isAdmin()) return true;

  const associations = user.isTeacher()
    ? await findTeacherDetails(user._id)
    : await findStudentDetails(user._id);

  if (!associations) return false;

  switch (postData.visibilityType) {
    case "Department":
      return user.isTeacher()
        ? postData.posted_to.id.equals(associations.departmentId)
        : associations.departmentIds.some((id) =>
            id.equals(postData.posted_to.id)
          );

    case "Course":
      return user.isTeacher()
        ? associations.courseIds.some((id) => id.equals(postData.posted_to.id))
        : postData.posted_to.id.equals(associations.courseId);

    case "Batch":
      return user.isTeacher()
        ? associations.batchIds.some((id) => id.equals(postData.posted_to.id))
        : postData.posted_to.id.equals(associations.batchId);

    default:
      return true;
  }
};
