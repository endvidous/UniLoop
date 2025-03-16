import mongoose from "mongoose";
import {
  Assignments,
  Assignment_Submissions,
  SUBMISSION_STATUS,
} from "../../models/assignmentModels.js";
import { Batches } from "../../models/courseModels.js";
import { findStudentDetails } from "../../services/userService.js";
import { bucketConfig, s3Client } from "../../config/awsS3.js";
import { DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import archiver from "archiver";

/*------------------------------Submission and attachment file Controllers------------------------------*/

const deleteFilesFromS3 = async (keys) => {
  if (!keys.length) return;
  // This method is incase we want to delete them in batches
  // But for now, we can delete them all at once

  //   const maxBatchSize = 10;
  //   for (let i = 0; i < keys.length; i += maxBatchSize) {
  //     const keysBatch = keys.slice(i, i + maxBatchSize);
  //     const command = new DeleteObjectsCommand({
  //       Bucket: bucketConfig.bucketName,
  //       Delete: { Objects: keysBatch.map((Key) => ({ Key })) },
  //     });

  const command = new DeleteObjectsCommand({
    Bucket: bucketConfig.bucketName,
    Delete: { Objects: keys.map((Key) => ({ Key })) },
  });
  await s3Client.send(command);
};

export const downloadSubmissionsZip = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user._id;

    // Verify that the teacher owns this assignment
    const assignment = await Assignments.findOne({
      _id: assignmentId,
      created_by: teacherId,
    });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or unauthorized",
      });
    }

    // Fetch all submissions for the assignment
    const submissions = await Assignment_Submissions.find({
      assignment: assignmentId,
    })
      .populate("student", "name email roll_no")
      .lean();

    // Set response headers for a zip download
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="submissions_${assignmentId}.zip"`,
    });

    // Initialize archiver
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // Process each submission: fetch the file from S3 and add it to the archive
    for (const sub of submissions) {
      if (sub.submission && sub.submission.key) {
        // Generate a file name, e.g., including the student's name if available
        const studentName =
          sub.student?.name?.replace(/[^a-z0-9_]/gi, "").substring(0, 50) ||
          "unknown";
        const studentRollNo = sub.submission.roll_no || "unknown";
        const zipEntryName = `${studentRollNo}_${studentName}`;

        // Create S3 GetObjectCommand and retrieve the file stream
        const params = {
          Bucket: bucketConfig.bucketName,
          Key: sub.submission.key,
        };
        const command = new GetObjectCommand(params);
        const s3Response = await s3Client.send(command);
        const fileStream = s3Response.Body;

        // Append the file stream to the archive with the specified file name
        archive.append(fileStream, { name: zipEntryName });
      }
    }

    // Finalize the archive (this will send the zipped data as the response)
    await archive.finalize();
  } catch (error) {
    console.error("Error generating zip file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate zip file",
      error: error.message,
    });
  }
};

/*------------------------------Assignment Controllers------------------------------*/
export const getAllAssignments = async (req, res) => {
  try {
    let assignments = [];
    if (req.user.isTeacher()) {
      // Teacher view: Only their created assignments
      assignments = await Assignments.find({ created_by: req.user._id })
        .populate("posted_to", "code startYear currentSemester")
        .sort({ deadline: 1 })
        .lean();
    }

    if (req.user.isStudent()) {
      // Student view: All assignments in their batch with personal status
      const { batchId } = await findStudentDetails(req.user._id);

      if (!batchId) {
        return res.status(404).json({
          success: false,
          message: "Student batch not found",
        });
      }

      assignments = await Assignments.find({
        posted_to: batchId,
      })
        .populate("posted_to", "code startYear currentSemester")
        .populate("created_by", "name email role")
        .lean();

      // Add personal submission status and deadline status
      assignments = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Assignment_Submissions.findOne({
            assignment: assignment._id,
            student: req.user._id,
          }).lean();

          const finalDeadline = assignment.late_deadline || assignment.deadline;
          const isOverdue = new Date() > finalDeadline;

          return {
            ...assignment,
            submission_status:
              submission?.status || SUBMISSION_STATUS.NOT_SUBMITTED,
            deadline_status: isOverdue ? "CLOSED" : "OPEN",
            final_deadline: finalDeadline, // Add this for frontend
          };
        })
      );
    }

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

export const getAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req.user._id;
  try {
    let assignment;
    if (req.user.isTeacher()) {
      assignment = await Assignments.findOne({
        _id: assignmentId,
        created_by: userId,
      })
        .populate("posted_to", "code startYear currentSemester")
        .populate({
          path: "submissions",
          select: "student submission status updatedAt",
          populate: {
            path: "student",
            select: "_id name email roll_no",
          },
        })
        .lean();

      // Map the submissions into a new array
      const mappedSubmissions = assignment.submissions?.map((sub) => ({
        _id: sub._id,
        status: sub.status,
        submitted_at: sub.updatedAt,
        attachment: sub.submission,
        student: sub.student,
      }));

      // Now add the counts based on the mapped submissions
      assignment = {
        ...assignment,
        submissions: mappedSubmissions,
        active_submissions: mappedSubmissions?.filter(
          (s) => s.status === SUBMISSION_STATUS.SUBMITTED
        ).length,
        late_submissions: mappedSubmissions?.filter(
          (s) => s.status === SUBMISSION_STATUS.LATE
        ).length,
        not_submitted: mappedSubmissions?.filter(
          (s) => s.status === SUBMISSION_STATUS.NOT_SUBMITTED
        ).length,
      };
    }

    if (req.user.isStudent()) {
      const { batchId } = await findStudentDetails(userId);
      assignment = await Assignments.findOne({
        _id: assignmentId,
        posted_to: batchId,
      })
        .populate("posted_to", "code startYear currentSemester")
        .populate("created_by", "name email role")
        .lean();

      if (assignment) {
        const submission = await Assignment_Submissions.findOne({
          assignment: assignmentId,
          student: userId,
        }).lean();

        assignment.student_submission = {
          status: submission?.status || SUBMISSION_STATUS.NOT_SUBMITTED,
          submitted_at: submission?.updatedAt,
          attachment: submission?.submission,
        };
      }
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};

export const createAssignment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const userId = req.user._id;
  try {
    const {
      posted_to,
      title,
      description,
      deadline,
      late_deadline,
      attachments,
    } = req.body;

    // Validate batch existence
    const batch = await Batches.findById(posted_to)
      .populate("students", "_id")
      .session(session);

    if (!batch) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Create new assignment
    const newAssignment = new Assignments({
      created_by: userId,
      posted_to,
      title,
      description,
      deadline,
      late_deadline: late_deadline || null,
      attachments: attachments || [],
    });

    const savedAssignment = await newAssignment.save({ session });

    // Create initial submissions for all batch students
    if (batch.students.length > 0) {
      const submissions = batch.students.map((student) => ({
        assignment: savedAssignment._id,
        student: student._id,
        status: SUBMISSION_STATUS.NOT_SUBMITTED,
      }));

      await Assignment_Submissions.insertMany(submissions, { session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: savedAssignment,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const updateAssignment = async (req, res) => {
  const userId = req.user._id;
  const { assignmentId } = req.params;
  try {
    const { title, description, deadline, late_deadline } = req.body;

    const updatedAssignment = await Assignments.findOneAndUpdate(
      {
        _id: assignmentId,
        created_by: userId,
      },
      { title, description, deadline, late_deadline },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!updatedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedAssignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

export const deleteAssignment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { assignmentId } = req.params;
  const userId = req.user._id;
  let keys;
  try {
    // Delete assignment
    const assignment = await Assignments.findOneAndDelete({
      _id: assignmentId,
      created_by: userId,
    }).session(session);

    if (!assignment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Assignment not found or unauthorized",
      });
    }

    // Retrieve all submissions related to this assignment (before deleting them)
    const submissions = await Assignment_Submissions.find({
      assignment: assignmentId,
    })
      .session(session)
      .lean();

    // Delete all related submissions
    await Assignment_Submissions.deleteMany(
      { assignment: assignmentId },
      { session }
    );

    // Extract S3 keys
    keys = [
      ...(assignment.attachments && assignment.attachments.length > 0
        ? assignment.attachments.map((att) => att.key)
        : []),
      ...submissions
        .filter((sub) => sub.submission?.key)
        .map((sub) => sub.submission.key),
    ];

    //Commiting the changes
    await session.commitTransaction();
    session.endSession();

    // Simple retry mechanism for S3 deletion
    let attempts = 0;
    const maxRetries = 3;
    let s3Error = null;

    while (attempts < maxRetries) {
      try {
        await deleteFilesFromS3(keys);
        s3Error = null;
        break;
      } catch (error) {
        s3Error = error;
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts)); // Backoff
      }
    }

    if (s3Error) {
      console.error("Final S3 deletion failed after retries:", {
        keys,
        error: s3Error.message,
      });
      // Consider sending an alert email/notification here
    }

    res.status(200).json({
      success: true,
      message:
        "Assignment deleted" + (s3Error ? " but some files might remain" : ""),
      warning: s3Error
        ? "Failed to delete some files - contact support"
        : undefined,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/*------------------------------Assignment Submission Controllers------------------------------*/
export const submitAssignment = async (req, res) => {
  const userId = req.user._id;
  const { assignmentId } = req.params;
  const { submission } = req.body;

  try {
    // Find the submission document for this student and assignment
    const submissionDoc = await Assignment_Submissions.findOne({
      assignment: assignmentId,
      student: userId,
    });

    if (!submissionDoc) {
      return res.status(404).json({
        success: false,
        message: "Submission record not found for this assignment",
      });
    }

    if (!submission.key || !submission.name || !submission.type) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission data",
      });
    }

    if (submissionDoc.submission?.key) {
      await deleteFilesFromS3([submissionDoc.submission.key]);
    }

    submissionDoc.submission = submission;

    // Save the document; the pre-save hook will validate deadlines and set status accordingly.
    await submissionDoc.save();

    res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      data: submissionDoc,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to submit assignment",
      error: error.message,
    });
  }
};

export const deleteAssignmentSubmission = async (req, res) => {
  const userId = req.user._id;
  const { assignmentId } = req.params;

  try {
    // Find the submission document for this student and assignment.
    const submissionDoc = await Assignment_Submissions.findOne({
      assignment: assignmentId,
      student: userId,
    });

    if (!submissionDoc) {
      return res.status(404).json({
        success: false,
        message: "Submission record not found",
      });
    }

    // If there's an attached file, delete it from S3.
    if (submissionDoc.submission && submissionDoc.submission.key) {
      await deleteFilesFromS3([submissionDoc.submission.key]);
    }

    // Remove the file data and update the status to NOT_SUBMITTED.
    submissionDoc.submission = undefined;
    submissionDoc.status = SUBMISSION_STATUS.NOT_SUBMITTED;
    await submissionDoc.save();

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
      data: submissionDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete submission",
      error: error.message,
    });
  }
};
