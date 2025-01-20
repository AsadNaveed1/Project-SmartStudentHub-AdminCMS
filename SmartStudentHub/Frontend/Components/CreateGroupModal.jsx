

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, TextInput, Button, useTheme } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Autocomplete from 'react-native-autocomplete-input';
import { GroupsContext } from '../Context/GroupsContext';


const departments = [
  {
    name: 'Architecture',
    courses: ['ARCH7305 Horticulture and Design', 'ARCH7500 Urban Planning'],
  },
  {
    name: 'Computer Science',
    courses: ['COMP3330 App Development', 'COMP2396 Object-oriented Programming and Java'],
  },
  {
    name: 'Biomedical Engineering',
    courses: ['BMED4505 Advanced Bioelectronics', 'BMED4600 Biomedical Imaging'],
  },
  {
    name: 'Economics',
    courses: ['ECON0501 Economic Development', 'ECON0600 Behavioral Economics'],
  },
  {
    name: 'School of Business',
    courses: ['STRA4701 Strategic Management', 'STRA4800 Marketing Analysis'],
  },
  
];

export default function CreateGroupModal({ visible, onDismiss }) {
  const theme = useTheme();
  const { addGroup, joinGroup } = useContext(GroupsContext);

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const handleCourseNameChange = (text) => {
    setCourseName(text);
    if (text.length > 0) {
      const department = departments.find((dept) => dept.name === selectedDepartment);
      if (department) {
        const regex = new RegExp(`${text}`, 'i');
        setFilteredCourses(
          department.courses.filter((course) => course.toLowerCase().includes(text.toLowerCase()))
        );
        setShowAutocomplete(true);
      }
    } else {
      setFilteredCourses([]);
      setShowAutocomplete(false);
    }
  };

  const handleSelectCourse = (course) => {
    const [code, ...nameParts] = course.split(' ');
    setCourseCode(code);
    setCourseName(nameParts.join(' '));
    setFilteredCourses([]);
    setShowAutocomplete(false);
  };

  const handleCreateGroup = () => {
    if (!selectedDepartment || !courseCode || !courseName) {
      alert('Please fill in all fields.');
      return;
    }

    
    const newGroup = {
      id: `${courseCode}-${Date.now()}`, 
      courseCode,
      courseName,
      department: selectedDepartment,
      commonCore: null,
      description: `Group for ${selectedDepartment} students enrolled in ${courseCode} ${courseName}.`,
    };

    addGroup(newGroup);
    joinGroup(newGroup.id); 

    
    setSelectedDepartment('');
    setCourseCode('');
    setCourseName('');
    setFilteredCourses([]);
    setShowAutocomplete(false);

    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Create New Group</Text>

        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Department</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDepartment}
            onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
            style={{ color: selectedDepartment ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}
          >
            <Picker.Item label="Select Department" value="" />
            {departments.map((dept) => (
              <Picker.Item key={dept.name} label={dept.name} value={dept.name} />
            ))}
          </Picker>
        </View>

        {selectedDepartment ? (
          <>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Course Code & Name</Text>
            <Autocomplete
              data={filteredCourses}
              defaultValue={courseName}
              onChangeText={handleCourseNameChange}
              placeholder="Enter course code or name"
              flatListProps={{
                keyExtractor: (_, idx) => idx.toString(),
                renderItem: ({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectCourse(item)}>
                    <Text style={[styles.autocompleteItem, { color: theme.colors.onSurface }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ),
              }}
              inputContainerStyle={styles.autocompleteContainer}
              listContainerStyle={styles.autocompleteListContainer}
              style={[styles.autocompleteInput, { color: theme.colors.onSurface }]}
            />
          </>
        ) : null}

        <Button mode="contained" onPress={handleCreateGroup} style={styles.createButton}>
          Create Group
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  autocompleteContainer: {
    borderWidth: 0,
  },
  autocompleteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  autocompleteListContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  autocompleteItem: {
    padding: 8,
  },
  createButton: {
    marginTop: 8,
  },
});