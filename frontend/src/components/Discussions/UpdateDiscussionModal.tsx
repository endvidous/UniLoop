import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TextInput, StyleSheet } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { debounce } from "lodash";

interface UpdateDiscussionModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialTitle: string;
  initialDescription: string;
  onSubmit: (title: string, description: string) => void;
}

const UpdateDiscussionModal: React.FC<UpdateDiscussionModalProps> = ({
  visible,
  onDismiss,
  initialTitle,
  initialDescription,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // Create debounced versions of the state setters
  const debouncedSetTitle = useMemo(() => debounce(setTitle, 100), []);

  const debouncedSetDescription = useMemo(
    () => debounce(setDescription, 100),
    []
  );

  // Handle cleanup for debounced functions
  useEffect(() => {
    return () => {
      debouncedSetTitle.cancel();
      debouncedSetDescription.cancel();
    };
  }, []);

  // Reset local state when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [visible, initialTitle, initialDescription]);

  const handleSubmit = useCallback(() => {
    // Flush any pending debounced updates
    debouncedSetTitle.flush();
    debouncedSetDescription.flush();
    onSubmit(title, description);
  }, [title, description, onSubmit]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Update Discussion</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.input}
            defaultValue={initialTitle}
            onChangeText={debouncedSetTitle}
            placeholder="Title"
            placeholderTextColor="#EBEBEB"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            defaultValue={initialDescription}
            onChangeText={debouncedSetDescription}
            placeholder="Description"
            placeholderTextColor="#EBEBEB"
            multiline
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleSubmit}>Update</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    color: "#EBEBEB",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});

export default UpdateDiscussionModal;
