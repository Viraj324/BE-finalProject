# LearnEase

## Problem Statement
The current online learning platforms lack personalization and feedback systems that can provide teachers and students with a more effective learning experience. Teachers often struggle to understand students' level of understanding and attentiveness during lectures, while students struggle with confusion and not being able to properly engage in lectures.

## Abstract
The proposed application aims to address these challenges by providing personalized learning experiences for both teachers and students. The application will utilize machine learning algorithms to analyze the learning methods of teachers and provide personalized suggestions to improve their teaching style for specific topics. We will also generate reports on student progress and auto-generate quizzes to help assess their understanding.

On the students' end, the application will monitor attentiveness and analyze their understanding of the lecture material. If the model detects confusion or a lack of understanding, we will provide personalized learning content to address the issue. At the end of the session, we will provide quizzes to assess the students' comprehension.

One of the main issues that we aim to solve is the lack of communication between teachers and students regarding the students' level of understanding. To address this, our application will analyze student performance and provide teachers with detailed reports on students' understanding, allowing them to identify areas where students need more help and provide personalized feedback to improve their learning experience.

## Objective
Our primary goal is to provide a comprehensive learning experience that caters to the unique needs of every student. To achieve this, we focus on the following key objectives:

1. **Personalized Learning**: Our platform offers personalized learning experiences that cater to each student's unique learning style and pace. By analyzing their learning history, our platform generates customized content that maximizes learning efficiency.

2. **Auto-generated Quizzes**: Our platform automates the quiz-generation process, saving teachers' time and providing instant feedback to students. The quizzes are generated based on the topics covered in each session, ensuring that students are tested on relevant material.

3. **Progress Tracking**: Our platform includes regular quizzes that track student progress and identify areas where additional support may be required. This feature enables teachers to focus on weaker areas and help students improve their overall performance.

4. **Engaging Lectures**: Our platform uses innovative strategies to improve student engagement during lectures. We use advanced technologies to track students' facial expressions, eyes, and mouth positions to predict their level of focus and attention. If a student appears unfocused or distracted, our platform provides simpler explanations of the topic to ensure that they fully understand the material.

5. **Session Summaries**: Our platform summarizes each session to make revision easier for students. We store the summary in the backend, making it easily accessible to students for future reference.

---

This is the backend code repository for the Online Learning Application. Follow these steps to set up the backend on your local machine.

## Prerequisites

Before you begin, make sure you have the following software installed on your system:

- [Node.js](https://nodejs.org/) - Make sure to install a version compatible with the project.
- [npm](https://www.npmjs.com/) (Node Package Manager) - It comes bundled with Node.js.

## Setup Instructions

1. **Clone the Repository:**

2. **Install Dependencies:**
   ``` bash
   npm install

3. **Environment Variables:**

    Create a .env file in the root directory of the project to store environment variables. You'll need to define variables such as database connection details and API keys.
    
    Example .env file:
    ``` env
    MONGO_URI=mongodb+srv:
    JWT_SECRET=ONLINE_LEARNING
    OPEN_AI=
    ```
    
4. **Start the Server:**
    ``` npm
    npm start
    ```

---

This is the frontend repository: https://github.com/OmNikam04/studyai


 
