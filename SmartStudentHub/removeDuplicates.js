// removeDuplicates.js

const fs = require('fs');
const path = require('path');

// Define input and output file paths
const inputFile = path.resolve(__dirname, 'department.js');
const outputFile = path.resolve(__dirname, 'department_cleaned.js');

// Check if the input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`\n❌ Input file "${inputFile}" does not exist. Please ensure the file path is correct.`);
  process.exit(1);
}

// Import the department data
let departmentData;
try {
  departmentData = require(inputFile);
} catch (err) {
  console.error(`\n❌ Error loading "${inputFile}":`, err);
  process.exit(1);
}

// Initialize sets to track seen course codes and names for 'N/A' codes
const seenCodes = new Set();
const seenNamesForNA = new Set();

// Initialize a new object to hold cleaned data
const cleanedData = {};

// Iterate through each department and its courses
for (const [deptName, courses] of Object.entries(departmentData)) {
  // Check if courses are in an array
  if (!Array.isArray(courses)) {
    console.warn(`\n⚠️ Warning: Courses for department "${deptName}" are not in an array. Skipping this department.`);
    continue;
  }

  const cleanedCourses = [];

  for (const course of courses) {
    const { code, name } = course;

    if (typeof code !== 'string' || typeof name !== 'string') {
      console.warn(`\n⚠️ Warning: Course in department "${deptName}" has invalid "code" or "name" type. Skipping this course.`);
      continue;
    }

    if (code !== 'N/A') {
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        cleanedCourses.push(course);
        // Optional: Log the addition
        // console.log(`✅ Added Course: "${name}" with code "${code}" in department "${deptName}".`);
      } else {
        console.log(`\n🗑️ Removed Duplicate: Course "${name}" with code "${code}" in department "${deptName}".`);
      }
    } else {
      if (!seenNamesForNA.has(name)) {
        seenNamesForNA.add(name);
        cleanedCourses.push(course);
        // Optional: Log the addition
        // console.log(`✅ Added 'N/A' Course: "${name}" in department "${deptName}".`);
      } else {
        console.log(`\n🗑️ Removed Duplicate 'N/A' Course: "${name}" in department "${deptName}".`);
      }
    }
  }

  // Assign the cleaned courses to the department in the cleanedData object
  cleanedData[deptName] = cleanedCourses;
}

// Prepare the content to write
const outputContent = `module.exports = ${JSON.stringify(cleanedData, null, 2)};`;

// Write to the output file
try {
  fs.writeFileSync(outputFile, outputContent, 'utf-8');
  console.log(`\n✅ Cleaned data successfully written to "${outputFile}".`);
} catch (err) {
  console.error(`\n❌ Error writing to file "${outputFile}":`, err);
  process.exit(1);
}