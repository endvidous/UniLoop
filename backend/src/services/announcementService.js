import { findTeacherDetails, findStudentDetails } from "./userService.js";

export const buildAnnouncementQuery = async (user) => {
  const baseConditions = {
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  };

  if (user.role === "admin") return baseConditions;

  if (user.role === "teacher") {
    const associations = await findTeacherDetails(user._id);
    if (!associations) return { _id: null }; // Return empty set

    return {
      ...baseConditions,
      $or: [
        { visibilityType: "General" },
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
        },
      ],
    };
  }

  if (user.role === "student") {
    const associations = await findStudentDetails(user._id);
    if (!associations) return { _id: null };

    return {
      ...baseConditions,
      $or: [
        { visibilityType: "General" },
        {
          visibilityType: "Department",
          "posted_to.id": { $in: associations.departmentIds },
        },
        {
          visibilityType: "Course",
          "posted_to.id": associations.courseId,
        },
        {
          visibilityType: "Batch",
          "posted_to.id": associations.batchId,
        },
      ],
    };
  }

  return { _id: null }; // Default for unrecognized roles
};

export const validateTeacherPosting = async (teacherId, announcementData) => {
  const associations = await findTeacherDetails(teacherId);

  if (announcementData.visibilityType === "Department") {
    if (!announcementData.posted_to.id.equals(associations.departmentId)) {
      return false;
    }
  }

  if (announcementData.visibilityType === "Course") {
    if (
      !associations.courseIds.includes(announcementData.posted_to.id.toString())
    ) {
      return false;
    }
  }

  if (announcementData.visibilityType === "Batch") {
    if (
      !associations.batchIds.some((id) =>
        id.equals(announcementData.posted_to.id)
      )
    ) {
      return false;
    }
  }

  return true;
};
