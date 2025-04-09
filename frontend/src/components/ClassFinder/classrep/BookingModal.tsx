import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useBookClassroom } from "@/src/hooks/api/useClassroom";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  bookingData: {
    classroomId: string;
    classroom: string;
    date: string;
    time: string;
    block: string;
  };
}

const BookingModal = ({ visible, onClose, bookingData }: BookingModalProps) => {
  const [purpose, setPurpose] = useState("");
  const { mutate: bookClassroom, isPending } = useBookClassroom();

  const handleBook = () => {
    if (!purpose.trim()) {
      alert("Please enter a purpose for booking");
      return;
    }

    // Convert time slot to start and end times
    const [startTimeStr, endTimeStr] = bookingData.time.split("-");
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);

    const bookingPayload = {
      classroomId: bookingData.classroomId,
      date: bookingData.date,
      startTime: startHour * 60 + startMinute, // Convert to minutes since midnight
      endTime: endHour * 60 + endMinute, // Convert to minutes since midnight
      purpose: purpose.trim(),
    };

    bookClassroom(bookingPayload, {
      onSuccess: () => {
        setPurpose("");
        onClose();
      },
      onError: (error) => {
        alert(`Booking failed: ${error.message}`);
      },
    });
  };

  const closeModal = () => {
    setPurpose("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
      onDismiss={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Book Classroom</Text>

          <View style={styles.bookingInfoContainer}>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Date:</Text>
              <Text style={styles.bookingInfoValue}>
                {new Date(bookingData.date).toLocaleDateString("en-GB")}
              </Text>
            </View>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Time:</Text>
              <Text style={styles.bookingInfoValue}>{bookingData.time}</Text>
            </View>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Block:</Text>
              <Text style={styles.bookingInfoValue}>{bookingData.block}</Text>
            </View>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>Room:</Text>
              <Text style={styles.bookingInfoValue}>
                {bookingData.classroom}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.purposeInput}
            placeholder="Enter purpose of booking"
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeModal}
              disabled={isPending}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.bookButton]}
              onPress={handleBook}
              disabled={isPending}
            >
              <Text style={styles.buttonText}>
                {isPending ? "Booking..." : "Book"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  bookingInfoContainer: {
    marginBottom: 20,
  },
  bookingInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bookingInfoLabel: {
    fontWeight: "bold",
    width: 80,
  },
  bookingInfoValue: {
    flex: 1,
  },
  purposeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 12,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  bookButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default BookingModal;
