import { AcademicTimeline } from "../../models/courseModels.js";

export const createAcademicTimeline = async (req, res) => {
  const { academicYear, oddSemester, evenSemester } = req.body;

  try {
    // Validate input
    if (!academicYear || !oddSemester || !evenSemester) {
      throw new Error(
        "All fields (academicYear, oddSemester, evenSemester) are required"
      );
    }

    // Validate academicYear format
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(academicYear)) {
      throw new Error("Invalid academicYear format. Use 'YYYY-YYYY'.");
    }

    // Check if academicYear already exists
    const existingTimeline = await AcademicTimeline.findOne({ academicYear });
    if (existingTimeline) {
      return res
        .status(409)
        .json({ message: "Academic timeline for this year already exists." });
    }

    // Valid dates check
    if (
      !oddSemester.start ||
      !oddSemester.end ||
      !evenSemester.start ||
      !evenSemester.end
    ) {
      throw new Error(
        "Both oddSemester and evenSemester must include 'start' and 'end' dates."
      );
    }

    // Validate start and end dates
    const oddStartDate = new Date(oddSemester.start);
    const oddEndDate = new Date(oddSemester.end);
    const evenStartDate = new Date(evenSemester.start);
    const evenEndDate = new Date(evenSemester.end);

    //  Invalid dates or incorrect logic check
    if (
      isNaN(oddStartDate.getTime()) ||
      isNaN(oddEndDate.getTime()) ||
      isNaN(evenStartDate.getTime()) ||
      isNaN(evenEndDate.getTime())
    ) {
      throw new Error("Invalid date format for semester start or end.");
    }

    if (oddStartDate >= oddEndDate || evenStartDate >= evenEndDate) {
      throw new Error("Semester start date must be earlier than its end date.");
    }

    // Save academic timeline
    const newTimeline = await AcademicTimeline.create({
      academicYear,
      oddSemester: { start: oddStartDate, end: oddEndDate },
      evenSemester: { start: evenStartDate, end: evenEndDate },
    });

    res.status(201).json({
      message: "Academic timeline created successfully",
      data: newTimeline,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating academic timeline",
      error: err.message,
    });
  }
};

