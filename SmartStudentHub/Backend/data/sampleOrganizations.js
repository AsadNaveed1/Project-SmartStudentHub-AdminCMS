const sampleOrganizations = [
  {
    organizationId: "1",
    name: "HKU",
    image: "https://via.placeholder.com/150", 
    description:
      "The University of Hong Kong (HKU) is a leading institution dedicated to academic excellence, research innovation, and community engagement.",
    location: "Hong Kong University Campus",
    type: "University",
    subtype: "Academic Institution",
  },
  {
    organizationId: "2",
    name: "ABC NGO",
    image: "https://via.placeholder.com/150",
    description:
      "ABC NGO is committed to community development through education, healthcare, and environmental conservation initiatives.",
    location: "ABC NGO Headquarters",
    type: "Non-Governmental Organization",
    subtype: "Volunteer-Based",
  },
  {
    organizationId: "3",
    name: "Health Org",
    image: "https://via.placeholder.com/150",
    description:
      "Health Org focuses on promoting health and wellness through various outreach programs, workshops, and fairs.",
    location: "Community Center Hall",
    type: "Community Organization",
    subtype: "Health and Wellness",
  },
  {
    organizationId: "4",
    name: "Art Gallery",
    image: "https://via.placeholder.com/150",
    description:
      "Art Gallery showcases contemporary and classical art from local and international artists, fostering creativity and appreciation.",
    location: "City Art Gallery",
    type: "Cultural Institution",
    subtype: "Visual Arts",
  },
  {
    organizationId: "5",
    name: "Music Club",
    image: "https://via.placeholder.com/150",
    description:
      "Music Club organizes live performances, workshops, and collaborative sessions for music enthusiasts to explore and showcase their talents.",
    location: "City Music Hall",
    type: "Student Society",
    subtype: "Performing Arts",
  },
  {
    organizationId: "6",
    name: "Art Collective",
    image: "https://via.placeholder.com/150",
    description:
      "Art Collective is a group of passionate artists dedicated to creating and exhibiting diverse forms of art, including sculpture, painting, and photography.",
    location: "Main Gallery, Art Collective Studio",
    type: "Artist Group",
    subtype: "Mixed Media",
  },
  {
    organizationId: "7",
    name: "Board Game Enthusiasts",
    image: "https://via.placeholder.com/150",
    description:
      "Board Game Enthusiasts hosts regular game nights, tournaments, and social events to bring together individuals passionate about board gaming.",
    location: "Community Hall",
    type: "Community Group",
    subtype: "Gaming",
  },
  {
    organizationId: "8",
    name: "Computer Science Association",
    image: "https://via.placeholder.com/150",
    description:
      "Computer Science Association promotes the study and application of computer science through workshops, contests, and lectures.",
    location: "Computer Lab, HKU Campus",
    type: "Academic Society",
    subtype: "Technology",
  },
  {
    organizationId: "9",
    name: "Tech Innovators Inc.",
    image: "https://via.placeholder.com/150",
    description:
      "Tech Innovators Inc. is at the forefront of technological advancements, hosting seminars and talks on emerging technologies.",
    location: "Auditorium, Tech Innovators Inc.",
    type: "Private Company",
    subtype: "Technology",
  },
  {
    organizationId: "10",
    name: "Debate Masters LLC",
    image: "https://via.placeholder.com/150",
    description:
      "Debate Masters LLC organizes intercollegiate debate competitions and workshops to enhance public speaking and critical thinking skills.",
    location: "Conference Center",
    type: "Private Company",
    subtype: "Education",
  },
  {
    organizationId: "11",
    name: "Smooth Jazz Entertainment",
    image: "https://via.placeholder.com/150",
    description:
      "Smooth Jazz Entertainment curates and hosts jazz concerts, providing a platform for talented musicians to perform.",
    location: "Concert Arena",
    type: "Entertainment Company",
    subtype: "Music",
  },
  {
    organizationId: "12",
    name: "Culinary School",
    image: "https://via.placeholder.com/150",
    description:
      "Culinary School offers hands-on cooking classes and workshops led by experienced chefs to cultivate culinary skills.",
    location: "Culinary School Kitchen",
    type: "Educational Institution",
    subtype: "Culinary Arts",
  },
  {
    organizationId: "13",
    name: "Green Earth",
    image: "https://via.placeholder.com/150",
    description:
      "Green Earth is dedicated to promoting environmental sustainability through various initiatives and community programs.",
    location: "Green Earth Center",
    type: "Non-Governmental Organization",
    subtype: "Environmental Conservation",
  },
  {
    organizationId: "14",
    name: "Business Network",
    image: "https://via.placeholder.com/150",
    description:
      "Business Network facilitates connections between professionals, fostering collaboration and business growth through networking events and seminars.",
    location: "Business Network Venue",
    type: "Community Group",
    subtype: "Networking",
  },
  // Adding organizations for events with "Others" subtype
  {
    organizationId: "15",
    name: "Kadoorie Centre - Shek Kong Centre",
    image: "https://via.placeholder.com/150",
    description: 
      "The Kadoorie Centre provides facilities for educational and recreational activities, focusing on environmental education and conservation.",
    location: "Shek Kong, New Territories",
    type: "Educational Institution",
    subtype: "Environmental Education",
  },
  {
    organizationId: "16",
    name: "Faculty of Social Sciences",
    image: "https://via.placeholder.com/150",
    description: 
      "The Faculty of Social Sciences at HKU is dedicated to the study of human society and social relationships through various disciplines.",
    location: "The Jockey Club Tower, Centennial Campus, HKU",
    type: "University",
    subtype: "Academic Faculty",
  },
  {
    organizationId: "17",
    name: "Urban Systems Institute",
    image: "https://via.placeholder.com/150",
    description: 
      "The Urban Systems Institute focuses on research and education related to urban development, planning, and sustainability.",
    location: "The University of Hong Kong",
    type: "University",
    subtype: "Research Institute",
  },
  {
    organizationId: "18",
    name: "HKU Horizons Office",
    image: "https://via.placeholder.com/150",
    description: 
      "The HKU Horizons Office provides opportunities for students to engage in international experiences and broaden their horizons.",
    location: "The University of Hong Kong",
    type: "University",
    subtype: "Student Services",
  },
  {
    organizationId: "19",
    name: "Faculty of Law",
    image: "https://via.placeholder.com/150",
    description: 
      "The Faculty of Law at HKU is dedicated to legal education, research, and promoting understanding of law in society.",
    location: "Cheng Yu Tung Tower, Centennial Campus, HKU",
    type: "University",
    subtype: "Academic Faculty",
  },
  {
    organizationId: "20",
    name: "Department of Psychology and Faculty of Social Sciences",
    image: "https://via.placeholder.com/150",
    description: 
      "The Department of Psychology and Faculty of Social Sciences focus on psychological research and education.",
    location: "The Jockey Club Tower, Centennial Campus, HKU",
    type: "University",
    subtype: "Academic Department",
  }
];

module.exports = sampleOrganizations;