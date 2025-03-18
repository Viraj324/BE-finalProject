# 🎓 AI-Driven Online Learning Platform

> An AI-powered MERN stack project to improve student engagement and teacher interaction in online learning environments through real-time attention detection, automated quiz generation, and note summarization.

---

## 📚 Abstract

This platform addresses the core issues in online education—such as student attentiveness, personalized content delivery, and teacher-student interaction—by integrating cutting-edge AI technologies. It combines machine learning, facial recognition, GANs, and LLMs with a robust MERN stack (MongoDB, Express, React, Node.js) to create a seamless and intelligent virtual classroom.

---

## 🛠️ Tech Stack

- **Frontend**: React.js  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **AI Libraries**:
  - 68-Face Landmark Detection (Dlib)
  - GANs for quiz generation
  - LLMs for note generation

---

## ✨ Features

### 1. Real-Time Attention Monitoring
- Tracks facial expressions, eye movement, and head orientation.
- Identifies distraction, drowsiness, and focus levels.
- Displays live attention feedback to teachers.

### 2. GAN-Based Quiz Generation
- Uses GANs to auto-generate quizzes based on lecture content.
- Adaptive difficulty per student’s progress.
- Instant feedback and gap identification.

### 3. LLM-Based Notes Summarization
- Summarizes class lectures into key bullet points.
- Highlights important concepts using LLMs.
- Saves student time and boosts understanding.

### 4. Teacher Suggestions
- AI suggests alternate teaching methods for better engagement.
- Personalized strategies based on student learning styles.

---

## 🧠 Architecture

### 🔹 System Architecture
![System Architecture](./assets/system-architecture.png)

### 🔹 Teacher Workflow
![Teacher Flow](./assets/teacher-flow.png)

### 🔹 Student Workflow
![Student Flow](./assets/student-flow.png)

---

## 📊 Performance Evaluation

![Performance Comparison](./assets/performance-analysis.png)

- **Facial Recognition Accuracy**: 85%  
- **Note Summarization Accuracy**: 88%  
- **Quiz Generation Efficiency**: 90%  
- **Engagement Detection Accuracy**: 92%  
- **Response Time**: ~5 seconds

---

## 🧪 Libraries & Datasets

- **68-Face Landmark Detection Library**  
  Detects and maps 68 facial features (eyes, jawline, mouth, etc.) using Dlib.

- **GAN Models**  
  Used to dynamically generate context-based quiz questions from lectures.

- **Large Language Models (LLMs)**  
  Utilized for real-time summarization and key point extraction.

---

## 📁 Folder Structure
project-root/ │ ├── frontend/ # React app │ ├── src/ │ └── .env │ ├── backend/ # Node.js API │ ├── routes/ │ ├── models/ │ └── .env │ ├── assets/ # Images & architecture diagrams │ └── README.md


---

## ⚙️ Setup Instructions

### 🔧 Backend Setup

```bash
cd backend
npm install

### 🌐 Frontend Setup
cd frontend
npm install
