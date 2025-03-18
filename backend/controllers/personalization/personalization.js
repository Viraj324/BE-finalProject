const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const axios = require("axios");
const Groq = require("groq-sdk");

const storage = require("node-persist");


const personalizationForStudent = catchAsyncErrors(async (req, res) => {
  
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const studentID = req.userId;
  const body = req.body;

  let value = await storage.getItem(body.topic);

  if (value == null) {

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `As an excellent teacher, you have the power to explain any topic in a way that a 12-year-old can understand. You'll be given a topic summary that you may not fully comprehend, and your job is to provide a simple explanation that even a child can grasp. If possible, please include an example to illustrate your point. If you're not familiar with the topic, simply return "false" \nHuman:${body.topic}\nAI:`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    // Print the completion returned by the LLM.
    console.log("GROQ explanation for student is : ", chatCompletion.choices[0]?.message?.content || "");


    const client = axios.create({
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    const params = {
      model: "llama-3.3-70b-versatile",
      prompt: `As an excellent teacher, you have the power to explain any topic in a way that a 12-year-old can understand. You'll be given a topic summary that you may not fully comprehend, and your job is to provide a simple explanation that even a child can grasp. If possible, please include an example to illustrate your point. If you're not familiar with the topic, simply return "false" \nHuman:${body.topic}\nAI:`,
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    client
      .post("https://api.groq.com/openai/v1/chat/completions", params)
      .then((response) => {
        var simplerExplanation = response.data.choices[0].text.trim();

        if (!simplerExplanation || simplerExplanation == "false") {
          return res.status(401).send({
            success: false,
            message: "failed to find simpler explanation",
          });
        }

        storage.setItem(body.topic, simplerExplanation);

        return res.status(201).send({
          success: true,
          message: "found simpler explanation from open ai",
          data: JSON.stringify({
            simplerExplanation: simplerExplanation,
            topic: body.topic,
          }),
        });
      })
      .catch((err) => {
        console.log(
          `${err.response.data.error.code} - ${err.response.data.error.message} `
        );
        return res.status(400).send({
          success: false,
          message: `${err.response.data.error.code} - ${err.response.data.error.message} `,
        });
      });
  } else {
    return res.status(201).send({
      success: true,
      message: "found simpler explanation from local storage",
      data: JSON.stringify({
        simplerExplanation: value,
        topic: body.topic,
      }),
    });
  }
});

const guidanceForTeacher = catchAsyncErrors(async (req, res) => {

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const teacherID = req.userId;

  const body = req.body;

  let value = await storage.getItem("teacher: " + body.topic);

  if (value == null) {

    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `As an AI mentor, you can assist teachers in enhancing their teaching techniques. Your role is to provide alternative explanations for topics that students may find challenging, and guide teachers on how to effectively communicate these concepts. When given a topic that students are struggling with, provide a clear and concise explanation that a teacher could use to enhance their lesson plan and guide the teacher. If you're not familiar with the topic, simply return "false" \nHuman:${body.topic}\nAI:`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });


    // Print the completion returned by the LLM.
    console.log("GROQ explanation for teacher is : ", chatCompletion.choices[0]?.message?.content || "");

    const client = axios.create({
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    const params = {
      model: "llama-3.3-70b-versatile",
      prompt: `As an AI mentor, you can assist teachers in enhancing their teaching techniques. Your role is to provide alternative explanations for topics that students may find challenging, and guide teachers on how to effectively communicate these concepts. When given a topic that students are struggling with, provide a clear and concise explanation that a teacher could use to enhance their lesson plan and guide the teacher. If you're not familiar with the topic, simply return "false" \nHuman:${body.topic}\nAI:`,
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    client
      .post("https://api.groq.com/openai/v1/chat/completions", params)
      .then((response) => {
        var simplerExplanation = response.data.choices[0].text.trim();

        if (!response || simplerExplanation == "false") {
          return res.status(401).send({
            success: false,
            message: "failed to find simpler explanation",
          });
        }

        storage.setItem("teacher: " + body.topic, simplerExplanation);

        return res.status(201).send({
          success: true,
          message: "found simpler guidance/explanation from open ai",
          data: JSON.stringify({
            simplerExplanation: simplerExplanation,
            topic: body.topic,
          }),
        });
      })
      .catch((err) => {
        console.log(
          `${err.response.data.error.code} - ${err.response.data.error.message} `
        );
        return res.status(400).send({
          success: false,
          message: `${err.response.data.error.code} - ${err.response.data.error.message} `,
        });
      });
  } else {
    return res.status(201).send({
      success: true,
      message: "found simpler guidance/explanation from local storage",
      data: JSON.stringify({
        simplerExplanation: value,
        topic: body.topic,
      }),
    });
  }
});

async function generateQuiz(summary) {
  const prompt = `Your expertise as a quiz generator can be valuable to teachers. Given a summary of a session, your role is to generate a multiple-choice quiz question with four options. The question should be related to the summary and have a clear correct answer. The output should include the question, the four options, correct answer, and explanation. Easily distinguish question, options, and correct answer with explanation.\nHuman: ${summary}\nAI:`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const quizResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const output = quizResponse.choices[0]?.message?.content.trim().split('\n').filter(Boolean);

    console.log("GROQ quiz response is : ", output);

    if (!output || output.length < 7) {
      throw new Error("Incomplete response data for quiz extraction.");
    }

    // Extract data based on the labeled keys in the response
    const question = output[0].replace('**Question:**', '').trim();

    const optionsIndex = output.findIndex(line => line.includes('**Options:**')) + 1;
    const options = output.slice(optionsIndex, optionsIndex + 4).map(option => option.trim());

    const correctAnswer = output.find(line => line.includes('**Correct Answer:**'))
      .replace('**Correct Answer:**', '').trim();

    const explanation = output.find(line => line.includes('**Explanation:**'))
      .replace('**Explanation:**', '').trim();

    return {
      question,
      options,
      correct_answer: correctAnswer,
      explanation,
    };

  } catch (error) {
    console.error("Error generating quiz:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}


async function getSummary(topic) {

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Summarize the given text and topic to me in simple words in 2-3 sentences, the words can be jumbled, so you might have to frame the sentence based on the text given. If you're not familiar with the topic, simply return "false" \nHuman:${topic}\nAI:`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    // Print the completion returned by the LLM.
    console.log("GROQ explanation summary is : ", chatCompletion.choices[0]?.message?.content || "");
    return chatCompletion.choices[0]?.message?.content || "";

  } catch (error) {
    // console.log("Error in getSummary : ", error);
    return false;
  }
}

const getExplanation = catchAsyncErrors(async (req, res) => {
  
  const body = req.body;
  // console.log("GROQ api for summarize is : ", body.topic);

  const summary = await getSummary(body.topic);
  const quiz = await generateQuiz(summary);
  // console.log("GROQ return for summary is : ", summary);
  // console.log("GROQ return for quiz is : ", quiz);

  return res.status(201).send({
    success: true,
    message: "Data fetched successfully",
    summary: summary,
    quiz: quiz,
  });
});

module.exports = {
  personalizationForStudent,
  guidanceForTeacher,
  getExplanation
};
