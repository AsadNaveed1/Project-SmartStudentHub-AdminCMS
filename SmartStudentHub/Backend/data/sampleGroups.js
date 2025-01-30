const sampleGroups = [
    // Computer Science Groups
    {
      groupId: '1',
      courseCode: 'COMP3330',
      courseName: 'App Development',
      department: 'Computer Science',
      commonCore: null,
      description: 'Group for students enrolled in COMP3330 App Development.',
    },
    {
      groupId: '2',
      courseCode: 'COMP3297',
      courseName: 'Software Engineering',
      department: 'Computer Science',
      commonCore: null,
      description: 'Group for students enrolled in COMP3297 Software Engineering.',
    },
  
    // Architecture Groups
    {
      groupId: '3',
      courseCode: 'ARCH7305',
      courseName: 'Horticulture and Design',
      department: 'Architecture',
      commonCore: null,
      description: 'Group for students enrolled in ARCH7305 Horticulture and Design.',
    },
  
    // Biomedical Engineering Programme Groups
    {
      groupId: '4',
      courseCode: 'BMED4505',
      courseName: 'Advanced Bioelectronics',
      department: 'Biomedical Engineering',
      commonCore: null,
      description: 'Group for students enrolled in BMED4505 Advanced Bioelectronics.',
    },
  
    // Economics Groups
    {
      groupId: '5',
      courseCode: 'ECON0501',
      courseName: 'Economic Development',
      department: 'Economics',
      commonCore: null,
      description: 'Group for students enrolled in ECON0501 Economic Development.',
    },
  
    // School of Business Groups
    {
      groupId: '6',
      courseCode: 'STRA4701',
      courseName: 'Strategic Management',
      department: 'School of Business',
      commonCore: null,
      description: 'Group for students enrolled in STRA4701 Strategic Management.',
    },
  
    // Common Core Groups
    {
      groupId: '7',
      courseCode: 'CCHU9001',
      courseName: 'Designs on the Future',
      department: null,
      commonCore: 'Arts and Humanities',
      description: 'Group for students enrolled in CCHU9001 Designs on the Future.',
    },
    {
      groupId: '8',
      courseCode: 'CCST9003',
      courseName: 'Everyday Computing and the Internet',
      department: null,
      commonCore: 'Science, Technology and Big Data',
      description: 'Group for students enrolled in CCST9003 Everyday Computing and the Internet.',
    },
    {
      groupId: '9',
      courseCode: 'CCGL9015',
      courseName: 'Globalization and Tourism',
      department: null,
      commonCore: 'Global Issues',
      description: 'Group for students enrolled in CCGL9015 Globalization and Tourism.',
    },
    {
      groupId: '10',
      courseCode: 'CCCH9012',
      courseName: 'China and World Order',
      department: null,
      commonCore: 'China: Culture, State and Society',
      description: 'Group for students enrolled in CCCH9012 China and World Order.',
    },
  
    // Others (Additional groups outside major and common cores)
    {
      groupId: '11',
      courseCode: 'GENERAL001',
      courseName: 'General Study Group',
      department: null,
      commonCore: null,
      description: 'A general study group for all students.',
    },
    // Add more sample groups as needed
  ];
  
module.exports = sampleGroups;