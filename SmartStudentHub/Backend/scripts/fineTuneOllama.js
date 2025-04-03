const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { spawn } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
async function fineTuneLlama() {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const baseModel = "llama3:8b";
  const fineTunedModelName = "event-benefits-llama";
  try {
    console.log("Checking if Ollama is running...");
    await axios.get(`${ollamaBaseUrl}/api/tags`);
    console.log(`Creating fine-tuned model: ${fineTunedModelName}`);
    const modelfilePath = path.join(__dirname, "Modelfile");
    fs.writeFileSync(
      modelfilePath,
      `
FROM ${baseModel}
PARAMETER temperature 0.7
PARAMETER top_k 40
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
# Add custom system message for events with benefits focus
SYSTEM You are a helpful assistant for a university campus events app. You help students find events and answer questions about campus activities based on the event information provided in the prompt. Always include the specific benefits of attending these events for the user and briefly explain how such events generally help people. Never mention event IDs in your responses. Do not use ** markdown for bold text in your responses.
`
    );
    const trainingDataPath = path.join(
      __dirname,
      "event_response_patterns.json"
    );
    if (!fs.existsSync(trainingDataPath)) {
      console.error(`Training data file not found at: ${trainingDataPath}`);
      console.error("Please run createFineTuningDataset.js first");
      return;
    }
    const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, "utf8"));
    console.log(`Loaded ${trainingData.length} training examples`);
    console.log("Creating base model...");
    const createProcess = spawn("ollama", [
      "create",
      fineTunedModelName,
      "-f",
      modelfilePath,
    ]);
    createProcess.stdout.on("data", (data) => {
      console.log(`${data}`);
    });
    createProcess.stderr.on("data", (data) => {
      console.error(`${data}`);
    });
    createProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Successfully created model: ${fineTunedModelName}`);
        console.log("Now performing training with examples...");
        trainWithExamples(fineTunedModelName, trainingData, ollamaBaseUrl);
      } else {
        console.error(
          `Failed to create model, process exited with code ${code}`
        );
      }
    });
  } catch (error) {
    console.error("Error in fine-tuning process:", error);
    if (error.response) {
      console.error("Ollama error details:", error.response.data);
    }
  }
}
async function trainWithExamples(modelName, trainingData, ollamaBaseUrl) {
  console.log(
    `Training model ${modelName} with ${trainingData.length} examples...`
  );
  for (let i = 0; i < trainingData.length; i++) {
    const example = trainingData[i];
    console.log(`Training with example ${i + 1}/${trainingData.length}...`);
    try {
      const prompt = `${example.instruction}\n\n${example.input}`;
      const expectedOutput = example.output;
      await axios.post(`${ollamaBaseUrl}/api/generate`, {
        model: modelName,
        prompt: prompt,
        system:
          "You are being trained to provide helpful responses for a university campus events app that highlights event benefits. Learn from this example. Never mention event IDs in your responses. Do not use ** markdown for bold text in your responses.",
        context: [],
        options: {
          num_predict: expectedOutput.length * 2,
          temperature: 0.1,
        },
        response: expectedOutput,
      });
      console.log(`Completed example ${i + 1}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error training with example ${i + 1}:`, error.message);
    }
  }
  console.log(`Training complete for ${modelName}!`);
  console.log("You can now update the chatbotService.js to use this model");
}
fineTuneLlama();
