const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Event = require("../models/Event");
const Organization = require("../models/Organization");
async function createFineTuningDataset() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/campus-app"
    );
    console.log("MongoDB connected for dataset creation");
    const events = await Event.find()
      .populate("organization", "name")
      .limit(100)
      .lean();
    if (events.length === 0) {
      console.log("No events found for dataset creation");
      return;
    }
    console.log(`Creating training data from ${events.length} events`);
    const trainingData = [];
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Using the provided event information, answer the user's question about event timing. Always include the specific benefits of attending this event and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event ID: E12345
Title: Annual Career Fair
Organization: Career Development Center
Type: Career
Date: 2025-04-15
Location: Student Union Building
Summary: Connect with employers from various industries for internship and job opportunities.
User Question: When is the Annual Career Fair?`,
      output:
        "The Annual Career Fair is scheduled for April 15, 2025, at the Student Union Building. By attending this career fair, you'll have the valuable opportunity to connect directly with potential employers and explore internship and job opportunities across various industries. Career fairs like this generally help students build their professional network, practice interview skills in a low-pressure environment, and often lead to job offers or follow-up interviews.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Using the provided event information, answer the user's question about event location. Always include the specific benefits of attending this event and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event ID: E54321
Title: Jazz Night
Organization: Music Department
Type: Concert
Date: 2025-03-22
Location: Performing Arts Center, Room 103
Summary: Join us for an evening of jazz performances by student ensembles.
User Question: Where will Jazz Night be held?`,
      output:
        "Jazz Night will be held at the Performing Arts Center, Room 103. Attending this event will give you the chance to enjoy exceptional jazz performances by talented student ensembles in a welcoming setting. Music events like Jazz Night offer great benefits beyond entertainment - they provide stress relief, opportunities to connect with peers who share similar interests, and exposure to new artistic expressions that can broaden your cultural appreciation.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Using the provided event information, answer the user's question about multiple events. Always include the specific benefits of attending these events and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event 1:
Event ID: E12345
Title: Hackathon
Organization: Computer Science Club
Type: Competition
Date: 2025-04-10
Location: Engineering Building
Summary: 24-hour coding competition with prizes.
Event 2:
Event ID: E23456
Title: Tech Talk: AI Ethics
Organization: Computer Science Department
Type: Lecture
Date: 2025-04-12
Location: Science Hall, Room 201
Summary: Discussion on ethical considerations in AI development.
Event 3:
Event ID: E34567
Title: Resume Workshop
Organization: Career Services
Type: Workshop
Date: 2025-04-15
Location: Library, Room 302
Summary: Learn how to create an effective resume for tech jobs.
User Question: What tech-related events are happening next month?`,
      output:
        "There are several tech-related events happening next month: a Hackathon organized by the Computer Science Club on April 10th at the Engineering Building, a Tech Talk on AI Ethics by the Computer Science Department on April 12th at Science Hall, and a Resume Workshop focused on tech jobs on April 15th at the Library. \n\nAttending these events would benefit you in multiple ways: the Hackathon provides hands-on programming experience and networking with peers, the AI Ethics talk will help you understand critical issues in a rapidly evolving field, and the Resume Workshop can directly improve your job prospects in the tech industry. \n\nTech events like these generally help students build relevant skills, stay current with industry developments, make connections with potential employers, and can significantly enhance your resume with real-world experience beyond classroom learning.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Using the provided event information, answer the user's question as best as possible when some information is missing. Always include the specific benefits of attending this event and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event ID: E78901
Title: Student Government Debate
Organization: Student Government Association
Type: Meeting
Date: [no date specified]
Location: [no location specified]
Summary: Candidates for student government positions will debate campus issues.
User Question: When and where is the Student Government Debate?`,
      output:
        "Based on the available information, the Student Government Debate is organized by the Student Government Association where candidates will debate campus issues. However, the specific date and location haven't been announced yet. I recommend checking the Student Government Association's website or social media for updates. \n\nAttending this debate would be beneficial as it allows you to evaluate the candidates who will represent student interests and make decisions that affect your campus experience. You'll gain insights into important campus issues and have the opportunity to make an informed voting decision. \n\nGenerally, student government events help foster civic engagement, give you a voice in university decisions, and provide valuable exposure to organizational leadership and democratic processes that are applicable beyond your college years.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Answer the user's question about event registration. Always include the specific benefits of attending this event and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event ID: E98765
Title: Entrepreneurship Workshop
Organization: Business School
Type: Workshop
Date: 2025-05-20
Location: Business Building, Room 305
Summary: Learn business planning and startup strategies
Registration: Required, $5 fee, register at business.university.edu/workshop
User Question: How do I register for the Entrepreneurship Workshop?`,
      output:
        "To register for the Entrepreneurship Workshop, you need to visit business.university.edu/workshop. Registration is required and there is a $5 fee. The workshop will be held on May 20, 2025, at the Business Building, Room 305. \n\nAttending this workshop would benefit you by providing practical knowledge about business planning and startup strategies directly from experienced faculty. The small registration fee is an investment in valuable skills that could help launch your future business ventures. \n\nEntrepreneurship workshops generally help students develop critical thinking and problem-solving abilities, understand market analysis, and build confidence in pursuing innovative ideas. These skills are valuable regardless of whether you start your own business or work within established organizations.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Help the user find events organized by a specific organization. Always include the specific benefits of attending these events and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event 1:
Event ID: E11111
Title: Research Symposium
Organization: Biology Department
Type: Academic
Date: 2025-04-05
Location: Science Center
Event 2:
Event ID: E22222
Title: Lab Open House
Organization: Biology Department
Type: Open House
Date: 2025-04-12
Location: Biology Building
Event 3:
Event ID: E33333
Title: Climate Change Panel
Organization: Environmental Science Club
Type: Panel Discussion
Date: 2025-04-08
Location: Student Center
User Question: What events is the Biology Department organizing?`,
      output:
        "The Biology Department is organizing two events: a Research Symposium on April 5th at the Science Center and a Lab Open House on April 12th at the Biology Building. \n\nAttending these Biology Department events would give you valuable exposure to current research and facilities. The Research Symposium provides insights into cutting-edge biological studies and networking opportunities with faculty and researchers. The Lab Open House offers a rare behind-the-scenes look at the equipment and methodologies used in biological research. \n\nBiology events like these generally help students better understand potential career paths, find research opportunities, and make connections with professors who might become mentors or provide recommendation letters. They're particularly valuable for anyone considering graduate school or careers in biological sciences.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Help the user find events related to a specific topic. Always include the specific benefits of attending these events and briefly explain how such events generally help users.",
      input: `EVENT INFORMATION:
Event 1:
Event ID: E44444
Title: Jazz Concert
Organization: Music Department
Type: Concert
Date: 2025-04-15
Location: Auditorium
Event 2:
Event ID: E55555
Title: Orchestra Performance
Organization: Music Department
Type: Concert
Date: 2025-04-22
Location: Performing Arts Center
Event 3:
Event ID: E66666
Title: Rock Band Showcase
Organization: Student Music Club
Type: Concert
Date: 2025-04-18
Location: Student Center
User Question: Are there any music events happening on campus?`,
      output:
        "Yes, there are several music events happening on campus. The Music Department is hosting a Jazz Concert on April 15th at the Auditorium and an Orchestra Performance on April 22nd at the Performing Arts Center. Additionally, the Student Music Club is organizing a Rock Band Showcase on April 18th at the Student Center. \n\nAttending these music events would enrich your campus experience by exposing you to different musical styles and talented performers. Each event offers a unique atmosphere - from the sophisticated arrangements of the Orchestra Performance to the energetic creativity of the Rock Band Showcase. \n\nMusic events generally help students reduce stress, build community with like-minded individuals, and provide cultural enrichment that complements academic pursuits. They offer a valuable break from studying while still contributing to your personal growth and well-being on campus.",
    });
    trainingData.push({
      instruction:
        "You are a helpful assistant for a university campus events app. Respond when there are no events matching the user's query. Still provide brief general information about the benefits of such events when they do occur.",
      input: `EVENT INFORMATION:
Event 1:
Event ID: E77777
Title: Basketball Tournament
Organization: Athletics Department
Type: Sports
Date: 2025-04-10
Location: Main Gym
Event 2:
Event ID: E88888
Title: Soccer Match
Organization: Athletics Department
Type: Sports
Date: 2025-04-17
Location: Soccer Field
User Question: Are there any swimming competitions coming up?`,
      output:
        "Based on the available event information, I don't see any upcoming swimming competitions. The Athletics Department is organizing a Basketball Tournament on April 10th at the Main Gym and a Soccer Match on April 17th at the Soccer Field, but there are no swimming events listed. You might want to check with the Athletics Department directly for information about swimming competitions. \n\nWhen swimming competitions do occur on campus, they offer valuable opportunities to support your peers, build school spirit, and enjoy high-level aquatic sports. Generally, attending athletic events like swimming competitions helps students maintain a balanced college experience, develop a sense of community, and take productive breaks from academic work – all of which contribute to overall well-being and campus engagement.",
    });
    try {
      for (let i = 0; i < Math.min(3, events.length); i++) {
        const event = events[i];
        if (event.title && event.date && event.location) {
          trainingData.push({
            instruction:
              "You are a helpful assistant for a university campus events app. Answer questions about real events with accurate information. Always include the specific benefits of attending this event and briefly explain how such events generally help users.",
            input: `EVENT INFORMATION:
Event ID: ${event.eventId || "N/A"}
Title: ${event.title || "N/A"}
Organization: ${event.organization?.name || "N/A"}
Type: ${event.type || "N/A"}
Date: ${event.date || "N/A"}
Location: ${event.location || "N/A"}
Summary: ${event.summary || "N/A"}
User Question: Tell me about the ${event.title} event.`,
            output: `The ${event.title} is an event organized by ${
              event.organization?.name || "the university"
            } on ${event.date} at ${event.location}. ${
              event.summary || ""
            }\n\nAttending this event would be beneficial as it provides you with an opportunity to ${getEventBenefits(
              event.type
            )}.\n\nEvents like this generally help students ${getGeneralBenefits(
              event.type
            )}.`,
          });
        }
      }
    } catch (error) {
      console.log("Error adding real event examples:", error.message);
    }
    fs.writeFileSync(
      path.join(__dirname, "event_response_patterns.json"),
      JSON.stringify(trainingData, null, 2)
    );
    console.log(
      `Created training dataset with ${
        trainingData.length
      } examples at: ${path.join(__dirname, "event_response_patterns.json")}`
    );
  } catch (error) {
    console.error("Error creating training dataset:", error);
  } finally {
    await mongoose.disconnect();
  }
}
function getEventBenefits(eventType) {
  const benefitsMap = {
    "University Event":
      "gain academic insights, connect with faculty, and strengthen your university community engagement",
    "External Event":
      "broaden your horizons beyond the university, network with industry professionals, and discover new opportunities",
    Career:
      "explore career paths, make industry connections, and potentially secure internships or jobs",
    Competition:
      "showcase your skills, challenge yourself, and possibly win recognition or prizes",
    Lecture:
      "gain deeper knowledge on specific topics from experts in the field",
    Workshop:
      "develop practical skills through hands-on activities in a structured environment",
    Concert:
      "enjoy high-quality performances, reduce stress, and appreciate the arts",
    Meeting:
      "participate in important discussions, have your voice heard, and contribute to organizational decisions",
    "Panel Discussion":
      "hear diverse perspectives on important topics from multiple experts",
    "Open House":
      "explore facilities and resources you might not normally have access to",
    Academic:
      "deepen your understanding of your field of study and engage with scholarly work",
  };
  return (
    benefitsMap[eventType] ||
    "engage with the university community and expand your knowledge and experiences"
  );
}
function getGeneralBenefits(eventType) {
  const generalBenefitsMap = {
    "University Event":
      "develop a sense of belonging to the university community, build connections with peers and faculty, and make the most of their educational experience",
    "External Event":
      "gain exposure to the broader community, build professional networks, and prepare for post-graduation opportunities",
    Career:
      "prepare for their professional future, understand industry expectations, and build connections that can lead to job opportunities",
    Competition:
      "develop problem-solving skills, learn to work under pressure, and build resilience",
    Lecture:
      "expand their knowledge, gain exposure to new ideas, and engage critically with complex topics",
    Workshop:
      "acquire practical skills, apply theoretical knowledge, and build confidence in their abilities",
    Concert:
      "reduce stress, appreciate culture, and develop a balanced lifestyle beyond academics",
    Meeting:
      "develop leadership skills, learn about organizational processes, and contribute to their community",
    "Panel Discussion":
      "understand complex issues from multiple perspectives and develop critical thinking skills",
    "Open House":
      "discover resources and opportunities they might otherwise miss, making better use of campus facilities",
    Academic:
      "deepen their understanding of their field, get inspired for research projects, and connect with mentors",
  };
  return (
    generalBenefitsMap[eventType] ||
    "enhance their overall educational experience, build valuable connections, and develop both personally and professionally"
  );
}
createFineTuningDataset();
