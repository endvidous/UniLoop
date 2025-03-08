import { Departments, Papers } from "../../models/courseModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";
import { User } from "../../models/userModels.js";
import mongoose from "mongoose";

//Department controllers
export const getDepartments = async (req, res) => {
  try {
    const departments = await Departments.find()
      .sort({ name: 1 })
      .select("-teachers");
    if (!departments.length) {
      return res.status(200).json({
        message: "No Departments found",
        data: [],
      });
    }

    res.status(200).json({
      message: "Departments retrieved successfully",
      count: departments.length,
      data: departments,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving departments", error: err.message });
  }
};

export const createDepartments = async (req, res) => {
  const { departments } = req.body;
  try {
    checkIfEmpty(departments);

    const departmentNamesMap = new Map();
    for (const department of departments) {
      if (!department.name) {
        res.status(400).json({ message: "Each department must have a name" });
      }

      // Check for duplicate
      if (departmentNamesMap.has(department.name)) {
        res.status(400).json({
          message: `Duplicate department names found`,
        });
      }
      departmentNamesMap.set(department.name, true);
    }

    const createdDepartments = await Departments.insertMany(departments);

    res.status(201).json({
      message: "Departments created sucessfully",
      data: createdDepartments,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Departments", error: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required for update" });
    }

    const existingDepartment = await Departments.findById(departmentId);
    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name === existingDepartment.name) {
      return res.status(400).json({ message: "No changes detected" });
    }

    // Check for duplicate name
    const duplicateDepartment = await Departments.findOne({ name });
    if (duplicateDepartment) {
      return res
        .status(409)
        .json({ message: "Department name already exists" });
    }

    const updatedDepartment = await Departments.findByIdAndUpdate(
      departmentId,
      { name },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating department",
      error: err.message,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  const { departmentId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the department without deleting
    const department = await Departments.findById(departmentId).session(
      session
    );
    if (!department) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Department not found" });
    }

    // 2. Delete associated papers first
    await Papers.deleteMany({ department: departmentId }).session(session);

    // 3. Delete associated teachers
    await User.deleteMany({ _id: { $in: department.teachers } }).session(
      session
    );

    // 4. Delete the department
    await Departments.findByIdAndDelete(departmentId).session(session);

    await session.commitTransaction();

    res.status(200).json({
      message: "Department and associated records deleted successfully",
      data: department,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Error deleting department",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};

//Paper controllers
export const getPapers = async (req, res) => {
  const { departmentId } = req.params;

  try {
    // Validate department ID format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID format" });
    }

    // Check if department exists
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find papers with matching department ID
    const papers = await Papers.find({ department: departmentId })
      .sort({ semester: 1 })
      .lean();

    res.status(200).json({
      message: "Papers retrieved successfully",
      count: papers.length,
      data: papers,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving papers",
      error: err.message,
    });
  }
};

export const createPapers = async (req, res) => {
  const { departmentId } = req.params;
  const { papers } = req.body;

  try {
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    checkIfEmpty(papers);

    const invalidPaper = papers.find((paper) => {
      !paper.name || !paper.code || !paper.semester;
    });
    if (invalidPaper) {
      throw new Error("Each paper must have name, code and semester");
    }

    const formattedPapers = papers.map((paper) => ({
      ...paper,
      department: departmentId,
    }));

    const createdPapers = await Papers.create(formattedPapers);

    res.status(201).json({
      message: "Papers created successfully",
      data: createdPapers,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ message: "Error creating Papers", error: err.message });
  }
};

export const updatePaper = async (req, res) => {
  const { departmentId, paperId } = req.params;
  const { name, code, semester } = req.body;

  try {
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    const paper = await Papers.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // Check for duplicate code within the same department (using the paper's existing department)
    if (code) {
      const existingPaper = await Papers.findOne({
        code: code,
        department: paper.department,
        _id: { $ne: paperId },
      });

      if (existingPaper) {
        return res
          .status(409)
          .json({ message: "Paper code already exists in this department" });
      }
    }

    // Only update the name, code, and semester fields
    const updatedPaper = await Papers.findByIdAndUpdate(
      paperId,
      { name, code, semester },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Paper updated successfully",
      data: updatedPaper,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating paper",
      error: err.message,
    });
  }
};

export const deletePaper = async (req, res) => {
  const { departmentId, paperId } = req.params;

  try {
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const paper = await Papers.findByIdAndDelete(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    res.status(200).json({
      message: "Paper deleted successfully",
      data: paper,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting paper",
      error: err.message,
    });
  }
};
