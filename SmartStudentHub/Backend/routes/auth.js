const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const authMiddleware = require("../middleware/auth");
const dotenv = require("dotenv");
dotenv.config();
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user.id,
        type: 'user'
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            university: user.university,
            universityYear: user.universityYear,
            degree: user.degree,
            degreeClassification: user.degreeClassification,
            faculty: user.faculty,
            department: user.department,
            bio: user.bio,
          },
          type: 'user'
        });
      }
    );
  } catch (error) {
    console.error("Login Route Error:", error.message);
    res.status(500).send("Server error");
  }
});
router.post("/organization/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const organization = await Organization.findOne({ email }).select("+password");
    if (!organization) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await organization.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: organization.id,
        type: 'organization'
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          organization: {
            id: organization.id,
            organizationId: organization.organizationId,
            name: organization.name,
            email: organization.email,
            description: organization.description,
            location: organization.location,
            type: organization.type,
            subtype: organization.subtype,
            image: organization.image
          },
          type: 'organization'
        });
      }
    );
  } catch (error) {
    console.error("Organization Login Route Error:", error.message);
    res.status(500).send("Server error");
  }
});
router.put("/profile", authMiddleware, async (req, res) => {
  const { fullName, username, university, universityYear, degree, degreeClassification, faculty, department, bio } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.university = university || user.university;
    user.universityYear = universityYear || user.universityYear;
    user.degree = degree || user.degree;
    user.degreeClassification = degreeClassification || user.degreeClassification;
    user.faculty = faculty || user.faculty;
    user.department = department || user.department;
    user.bio = bio || user.bio;
    await user.save();
    res.json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      university: user.university,
      universityYear: user.universityYear,
      degree: user.degree,
      degreeClassification: user.degreeClassification,
      faculty: user.faculty,
      department: user.department,
      bio: user.bio,
    });
  } catch (error) {
    console.error("Update Profile Route Error:", error.message);
    res.status(500).send("Server error");
  }
});
router.post("/signup", async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    university,
    universityYear,
    degree,
    degreeClassification,
    faculty,
    department,
    bio,
  } = req.body;
  if (
    !fullName ||
    !username ||
    !email ||
    !password ||
    !university ||
    !universityYear ||
    !degree ||
    !degreeClassification ||
    !faculty ||
    !department
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }
  const validDegreeClassifications = ['undergraduate', 'postgraduate', 'staff'];
  if (!validDegreeClassifications.includes(degreeClassification.toLowerCase())) {
    return res.status(400).json({ message: "Invalid degree classification." });
  }
  const validFaculties = [
    'Faculty of Architecture',
    'Faculty of Business and Economics',
    'Faculty of Engineering',
    'Faculty of Medicine',
    'Faculty of Science',
  ];
  if (!validFaculties.includes(faculty)) {
    return res.status(400).json({ message: "Invalid faculty selection." });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already registered." });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already taken." });
    }
    user = new User({
      fullName,
      username,
      email,
      password,
      university,
      universityYear,
      degree,
      degreeClassification: degreeClassification.toLowerCase(),
      faculty,
      department,
      bio,
    });
    await user.save();
    const payload = {
      user: {
        id: user.id,
        type: 'user'
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            university: user.university,
            universityYear: user.universityYear,
            degree: user.degree,
            degreeClassification: user.degreeClassification,
            faculty: user.faculty,
            department: user.department,
            bio: user.bio,
          },
          type: 'user'
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
router.post("/organization/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    description,
    location,
    type,
    subtype,
    image
  } = req.body;
  if (!name || !email || !password || !description || !location || !type) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  try {
    let organization = await Organization.findOne({ email });
    if (organization) {
      return res.status(400).json({ message: "Email already registered." });
    }
    const organizationId = `org_${Date.now()}`;
    organization = new Organization({
      organizationId,
      name,
      email,
      password,
      description,
      location,
      type,
      subtype: subtype || null,
      image: image || "https://via.placeholder.com/150"
    });
    await organization.save();
    const payload = {
      user: {
        id: organization.id,
        type: 'organization'
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          organization: {
            id: organization.id,
            organizationId: organization.organizationId,
            name: organization.name,
            email: organization.email,
            description: organization.description,
            location: organization.location,
            type: organization.type,
            subtype: organization.subtype,
            image: organization.image
          },
          type: 'organization'
        });
      }
    );
  } catch (error) {
    console.error("Organization Signup Error:", error.message);
    res.status(500).send("Server error");
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'organization') {
      const organization = await Organization.findById(req.user.id).select("-password");
      if (!organization) {
        return res.status(404).json({ message: "Organization not found." });
      }
      return res.json({
        organization,
        type: 'organization'
      });
    } else {
      const user = await User.findById(req.user.id)
        .select("-password")
        .populate("joinedGroups", "groupId courseName description")
        .populate("registeredEvents", "eventId title description date time location");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      return res.json({
        user,
        type: 'user'
      });
    }
  } catch (error) {
    console.error("GET /me Error:", error.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;