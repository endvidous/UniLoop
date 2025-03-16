import { useAuth } from "@/src/context/AuthContext";
import {
  useAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from "@/src/hooks/api/useAssignments";
import {
  TeacherAssignment,
  UpdateAssignmentData,
} from "@/src/services/api/assignmentAPI";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Attachment } from "../../common/AttachmentViewer";

const TeacherAssignmentDetailView = ({ id }: { id: string }) => {
  const { user } = useAuth();
  //Assignment hooks
  const { data, isLoading, isError, error, refetch } = useAssignment(id);
  const { mutate: deleteAssignment } = useDeleteAssignment();
  const { mutate: updateAssignment } = useUpdateAssignment();
  //Destructing assignment from data
  const assignment = data?.data as TeacherAssignment;

  //Edit hooks form
  const { control, handleSubmit, reset, getValues } =
    useForm<UpdateAssignmentData>({
      defaultValues: {
        title: "",
        description: "",
      },
    });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  //Loading data into form when it first renders
  useEffect(() => {
    if (assignment) {
      reset({
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        late_deadline: assignment?.late_deadline || undefined,
      });
      setAttachments(assignment?.attachments || []);
    }
  }, [assignment, reset]);

  // Calculate submission stats
  const totalStudents =
    (assignment.active_submissions || 0) +
    (assignment.late_submissions || 0) +
    (assignment.not_submitted || 0);

  const submissionRate =
    totalStudents > 0
      ? Math.round(((assignment.active_submissions || 0) / totalStudents) * 100)
      : 0;

  //Refresh Functionality
  const [refreshing, setRefreshing] = useState(false);
  const OnRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
        }
      >
        <Text style={styles.errorText}>
          Error loading announcement: {error?.message}
        </Text>
      </ScrollView>
    );
  }

  return (
    <View
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
      }
    >
      <View>
        <Text>{assignment.title}</Text>
        <Text>{assignment.description}</Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default TeacherAssignmentDetailView;
