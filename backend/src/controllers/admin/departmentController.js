import { Departments, Papers } from "../../models/courseModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";

export const createDepartments = async (req, res) => {
  const { departments } = req.body;
  try {
    checkIfEmpty(departments);

    const invalidDepartment = departments.find(
      (department) => !department.name
    );
    if (invalidDepartment) {
      throw new Error("Each department must have a name");
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
    res
      .status(500)
      .json({ message: "Error creating Papers", error: err.message });
  }
};
