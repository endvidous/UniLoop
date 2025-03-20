import StudentAssignmentDetailView from "@/src/components/Assignments/student/AssignmentDetail";
import { useLocalSearchParams } from "expo-router";

const AssignmentDetailView = () => {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  console.log(assignmentId);
  return <StudentAssignmentDetailView id={assignmentId} />;
};

export default AssignmentDetailView;
