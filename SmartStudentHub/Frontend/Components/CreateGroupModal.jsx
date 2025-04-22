import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  useTheme,
  HelperText,
  TouchableRipple,
  Menu,
} from 'react-native-paper';
import { GroupsContext } from '../newcontext/GroupsContext';

const CreateGroupModal = ({ visible, onDismiss }) => {
  const theme = useTheme();
  const { addGroup, joinGroup } = useContext(GroupsContext);

  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseMenuVisible, setCourseMenuVisible] = useState(false);
  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const departments = [
    'Architecture',
    'Computer Science',
    'Biomedical Engineering',
    'Economics',
    'School of Business',
  ];

  const coursesByDepartment = {
    'Architecture': ['ARCH7305 Horticulture and Design', 'ARCH7500 Urban Planning'],
    'Computer Science': ['COMP3330 App Development', 'COMP2396 Object-oriented Programming and Java'],
    'Biomedical Engineering': ['BMED4505 Advanced Bioelectronics', 'BMED4600 Biomedical Imaging'],
    'Economics': ['ECON0501 Economic Development', 'ECON0600 Behavioral Economics'],
    'School of Business': ['STRA4701 Strategic Management', 'STRA4800 Marketing Analysis'],
  };

  const resetForm = () => {
    setDepartment('');
    setCourseCode('');
    setCourseName('');
    setErrors({});
  };

  const handleSelectCourse = (course) => {
    const [code, ...nameParts] = course.split(' ');
    setCourseCode(code);
    setCourseName(nameParts.join(' '));
    setCourseMenuVisible(false);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!department) {
      newErrors.department = 'Department is required';
    }
    
    if (!courseCode || !courseName) {
      newErrors.course = 'Course is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = () => {
    if (validate()) {
      const newGroup = {
        id: `${courseCode}-${Date.now()}`,
        courseCode,
        courseName,
        department: department,
        commonCore: null,
        description: `Group for ${department} students enrolled in ${courseCode} ${courseName}.`,
        groupId: `${courseCode}-${Date.now()}`,
      };

      addGroup(newGroup);
      joinGroup(newGroup.id);
      
      resetForm();
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background }
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                Create New Study Group
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>Department *</Text>
                <Menu
                  visible={departmentMenuVisible}
                  onDismiss={() => setDepartmentMenuVisible(false)}
                  anchor={
                    <TouchableRipple
                      onPress={() => setDepartmentMenuVisible(true)}
                      style={styles.menuTouchable}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          label="Select Department"
                          value={department}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          error={!!errors.department}
                          right={<TextInput.Icon name="menu-down" />}
                        />
                      </View>
                    </TouchableRipple>
                  }
                >
                  {departments.map((dept) => (
                    <Menu.Item
                      key={dept}
                      onPress={() => {
                        setDepartment(dept);
                        setDepartmentMenuVisible(false);
                        setCourseCode('');
                        setCourseName('');
                      }}
                      title={dept}
                    />
                  ))}
                </Menu>
                {errors.department && (
                  <HelperText type="error">{errors.department}</HelperText>
                )}
              </View>

              {department && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>Course *</Text>
                  <Menu
                    visible={courseMenuVisible}
                    onDismiss={() => setCourseMenuVisible(false)}
                    anchor={
                      <TouchableRipple
                        onPress={() => setCourseMenuVisible(true)}
                        style={styles.menuTouchable}
                      >
                        <View pointerEvents="none">
                          <TextInput
                            label="Select Course"
                            value={courseCode && courseName ? `${courseCode} ${courseName}` : ''}
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                            error={!!errors.course}
                            right={<TextInput.Icon name="menu-down" />}
                          />
                        </View>
                      </TouchableRipple>
                    }
                  >
                    {coursesByDepartment[department]?.map((course) => (
                      <Menu.Item
                        key={course}
                        onPress={() => handleSelectCourse(course)}
                        title={course}
                      />
                    ))}
                  </Menu>
                  {errors.course && (
                    <HelperText type="error">{errors.course}</HelperText>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleCreateGroup}
                  style={styles.confirmButton}
                >
                  Create Group
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    resetForm();
                    onDismiss();
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginBottom: 10,
  },
  menuTouchable: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
  },
  confirmButton: {
    marginBottom: 10,
  },
  cancelButton: {},
});

export default CreateGroupModal;