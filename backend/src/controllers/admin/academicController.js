import { AcademicTimeline } from "../../models/courseModels.js";

export const getAcademicTimelines = async (req, res) => {
  try {
    const timelines = await AcademicTimeline.find().sort({ academicYear: 1 });

    if (!timelines.length) {
      return res.status(200).json({
        message: "No academic timelines found",
        data: [],
      });
    }

    res.status(200).json({
      message: "Academic timelines retrieved successfully",
      count: timelines.length,
      data: timelines,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving academic timelines",
      error: err.message,
    });
  }
};

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

export const deleteAcademicTimeline = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Timeline ID is required" });
    }

    const deletedTimeline = await AcademicTimeline.findByIdAndDelete(id);
    if (!deletedTimeline) {
      return res.status(404).json({ message: "Academic timeline not found" });
    }

    res.status(200).json({
      message: "Academic timeline deleted successfully",
      data: deletedTimeline,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting academic timeline",
      error: err.message,
    });
  }
};

export const updateAcademicTimeline = async (req, res) => {
  const { id } = req.params;
  const { academicYear, oddSemester, evenSemester } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: "Timeline ID is required" });
    }

    const existingTimeline = await AcademicTimeline.findById(id);
    if (!existingTimeline) {
      return res.status(404).json({ message: "Academic timeline not found" });
    }

    const updateData = {};

    // Validate and check academicYear changes
    if (academicYear) {
      const yearPattern = /^\d{4}-\d{4}$/;
      if (!yearPattern.test(academicYear)) {
        throw new Error("Invalid academicYear format. Use 'YYYY-YYYY'.");
      }

      if (academicYear !== existingTimeline.academicYear) {
        const duplicateTimeline = await AcademicTimeline.findOne({
          academicYear,
          _id: { $ne: id },
        });
        if (duplicateTimeline) {
          return res.status(409).json({
            message: "Academic timeline for this year already exists.",
          });
        }
        updateData.academicYear = academicYear;
      }
    }

    // Helper function to validate and compare semesters
    const processSemester = (newSemester, existingSemester, semesterName) => {
      if (!newSemester) return null;

      // Validate structure
      if (!newSemester.start || !newSemester.end) {
        throw new Error(`Both dates are required for ${semesterName}`);
      }

      // Validate dates
      const startDate = new Date(newSemester.start);
      const endDate = new Date(newSemester.end);

      if (isNaN(startDate) || isNaN(endDate)) {
        throw new Error(`Invalid date format for ${semesterName}`);
      }

      if (startDate >= endDate) {
        throw new Error(`${semesterName} start date must be before end date`);
      }

      // Compare with existing dates
      const hasChanged =
        startDate.getTime() !== existingSemester.start.getTime() ||
        endDate.getTime() !== existingSemester.end.getTime();

      return hasChanged ? { start: startDate, end: endDate } : null;
    };

    // Process odd semester
    if (oddSemester) {
      const processedOdd = processSemester(
        oddSemester,
        existingTimeline.oddSemester,
        "oddSemester"
      );
      if (processedOdd) updateData.oddSemester = processedOdd;
    }

    // Process even semester
    if (evenSemester) {
      const processedEven = processSemester(
        evenSemester,
        existingTimeline.evenSemester,
        "evenSemester"
      );
      if (processedEven) updateData.evenSemester = processedEven;
    }

    // Check if any changes were detected
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    // Perform the update
    const updatedTimeline = await AcademicTimeline.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Academic timeline updated successfully",
      data: updatedTimeline,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating academic timeline",
      error: err.message,
    });
  }
};
