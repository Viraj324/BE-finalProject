import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import * as faceapi from "face-api.js";

const Room = () => {
  const sessionid = useParams();

  // console.log(sessionid.roomId);

  const apiKey = process.env.REACT_APP_STUDYAI_API;
  const key = `${apiKey}/room/${sessionid.roomId}/topics`;

  const [roomdetail, setRoomdetail] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [quizID, setQuizID] = useState("");

  const [title, setTitle] = useState();

  const videoRef = useRef(null);
  const socketRef = useRef();
  const canvasRef = useRef(null);

  const [modelStatus, setModelStatus] = useState("loading");
  const [attentionState, setAttentionState] = useState("initializing");
  const [metrics, setMetrics] = useState({
    eyeOpenness: 0,
    headOrientation: 0,
    lastUpdate: null,
  });
  const [attentionHistory, setAttentionHistory] = useState([])

  const [isSessionLive, setIsSessionLive] = useState(false);

  const CONFIG = {
    updateInterval: 5000, // Check every 5 seconds as requested
    thresholds: {
      earThreshold: 0.22, // Eye aspect ratio threshold for closed eyes
      headAngleMin: 170, // Minimum acceptable head angle
      headAngleMax: 190, // Maximum acceptable head angle
    },
  };

  var getid = true;

  useEffect(() => {
    axios
      .get(key, {})
      .then((res) => {
        const data = res.data;

        setTitle(data.data[0].title);
        setRoomdetail(data.data[0].topics);
        setTeacher(data.data[0].creator);

        setQuizID(data.data[0].quiz);

        if (true) {
          setIsSessionLive(true);
          connectToWS();
          enableCameraMode();
        }
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  }, [key]);

  const navigate = useNavigate();

  const handleQuiz = () => {
    // alert("button kaam kar rahi hai");
    axios
      .get(key, {})
      .then((res) => {
        const data = res.data;
        setQuizID(data.data[0].quiz);
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });

    navigate(`/student/quiz/${quizID}`);
  };

  const connectToWS = async () => {
    socketRef.current = io(process.env.REACT_APP_STUDYAI_WS);

    let student = sessionStorage.getItem("student");
    student = JSON.parse(student);
    // Join room
    socketRef.current.emit("join_room", {
      _id: sessionid.roomId,
      student: {
        id: student.student._id,
        name: student.student.firstName,
        email: student.student.emailID,
      },
    });

    // check if the session is still active
    socketRef.current.on("classroom_finished", (id) => {

      alert("Session has ended. Click on the quiz button to view the quiz.");
      setIsSessionLive(false);
    });

  };

  const enableCameraMode = async () => {
    try {
      await loadModels();
      await startCamera();

      let student = sessionStorage.getItem("student");
      student = JSON.parse(student);

      // Start periodic tracking every 5 seconds
      setInterval(async () => {
     await  analyzeAttention();

      }, CONFIG.updateInterval);
    } catch (error) {
      console.error("Setup error:", error);
      setModelStatus("error");
    }
  };

  // Load face-api models
  const loadModels = async () => {
    try {
      setModelStatus("loading");

      // Define model paths - try CDN if local fails
      const MODEL_URL = "/weights";
      // Fallback: 'https://justadudewhohacks.github.io/face-api.js/weights'

      // Load only the essential models we need for eye tracking
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      setModelStatus("ready");
    } catch (error) {
      console.error("Model loading error:", error);
      setModelStatus("error");
      throw new Error("Failed to load face detection models");
    }
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Return a promise that resolves when video is ready
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      throw new Error("Failed to access camera");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Calculate eye aspect ratio
  const calculateEAR = (eye) => {
    try {
      // Vertical distances
      const v1 = distance(eye[1], eye[5]);
      const v2 = distance(eye[2], eye[4]);

      // Horizontal distance
      const h = distance(eye[0], eye[3]);

      // Avoid division by zero
      if (h === 0) return 0;

      // Calculate EAR
      return (v1 + v2) / (2.0 * h);
    } catch (error) {
      console.error("EAR calculation error:", error);
      return 0;
    }
  };

  // Calculate Euclidean distance between two points
  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Calculate center point of a group of points
  const centerPoint = (points) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };

    const sum = points.reduce(
      (acc, point) => {
        return { x: acc.x + point.x, y: acc.y + point.y };
      },
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  };

  // Calculate head orientation angle
  const calculateHeadAngle = (leftEye, rightEye) => {
    // Get center points of each eye
    const leftCenter = centerPoint(leftEye);
    const rightCenter = centerPoint(rightEye);

    // Calculate angle
    const dx = rightCenter.x - leftCenter.x;
    const dy = rightCenter.y - leftCenter.y;

    // Convert to degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    return angle;
  };

  // Analyze face and determine attention state
  const analyzeAttention = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;

      // Skip if video isn't playing
      if (video.paused || video.ended) return;

      // Detect face and landmarks
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.6 })
        )
        .withFaceLandmarks();

      // If no face detected
      if (!detection) {
        setAttentionState("unfocused");
        setMetrics((prev) => ({
          ...prev,
          lastUpdate: new Date().toLocaleTimeString(),
        }));
        return;
      }

      // Extract landmarks
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Calculate metrics
      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      const headAngle = calculateHeadAngle(leftEye, rightEye);

      // Update metrics state
      setMetrics({
        eyeOpenness: avgEAR,
        headOrientation: headAngle,
        lastUpdate: new Date().toLocaleTimeString(),
      });


      // Determine final state
      let newState;

      if (headAngle > 340 && headAngle <= 370 && avgEAR < 0.3) {
        newState = "focused";
      } else if (avgEAR > 0.3) {
        newState = "unfocused";
      } else {
        newState = "sleepy";
      }
console.log("New state " , newState)
getAttentionPercentage(newState)
      setAttentionState(newState);
      return newState
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  // Determine the color for the attention state indicator
  const getStateColor = () => {
    switch (attentionState) {
      case "focused":
        return "bg-green-500";
      case "unfocused":
        return "bg-yellow-500";
      case "sleepy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };


  function getAttentionPercentage(newState) {
    let student = sessionStorage.getItem("student");
    student = JSON.parse(student);
    const stateMap = {
      sleepy: 0.1,
      unfocused: 0.2,
      focused: 0.9,
    };
    const newAttentionHistory = attentionHistory;
    newAttentionHistory.push(stateMap[newState])
    console.log(newState, newAttentionHistory)
    if (newAttentionHistory.length === 0) return 0;

    const sum = newAttentionHistory.reduce((acc, val) => acc + val, 0);
    const average = sum / newAttentionHistory.length;
    console.log(sum, newAttentionHistory.length)
    setAttentionHistory(newAttentionHistory)

    let pt = Math.round(average * 100);

    socketRef.current.emit("update_attention", {
      _id: sessionid.roomId,
      student: {
        id: student.student._id,
        name: student.student.firstName,
        email: student.student.emailID,
        attention: pt,
      },
      attention: pt,
    });




    return pt; // return as a whole percentage
  }

  return (
    <div>
      <div className="bg-purplebg min-h-screen">
        <Navbar />
        <div className="px-[2rem] p-4 flex flex-col space-y-5">
          <div className="w-full p-2 flex flex-row justify-between bg-white rounded-lg drop-shadow-md space-y-4">
            <div>
              <h1 className="text-4xl font-bold">{title}</h1>
              <p className="text-gray-700 mt-2">
                Conducted by{" "}
                <span className="font-bold">{teacher.firstName}</span>
              </p>
            </div>
            <button
              className="rounded-lg bg-black text-white px-2"
              onClick={handleQuiz}
            >
              Take Quiz
            </button>
          </div>

          {isSessionLive ? (
            <>
              {/* Status indicator */}
              <div className="mb-4 w-full flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${getStateColor()}`}
                ></div>
                <span className="font-medium">
                  Status:{" "}
                  {attentionState.charAt(0).toUpperCase() +
                    attentionState.slice(1)}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  Updated: {metrics.lastUpdate || "Not yet"}
                </span>
              </div>

              {/* Video feed - only visible to the system, not displayed prominently */}
              <div className="relative w-full mb-3">
                <video
                  ref={videoRef}
                  className="w-full h-auto opacity-0 absolute" // Hidden but functional
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto hidden" // Hidden canvas for processing
                />

                {/* Placeholder that shows instead of the actual video */}
                <div
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center"
                  style={{ height: "240px" }}
                >
                  <div
                    className={`w-16 h-16 rounded-full mb-2 flex items-center justify-center ${getStateColor()}`}
                  >
                    {attentionState === "focused" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {attentionState === "unfocused" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                    {attentionState === "sleepy" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-center text-gray-600 mt-2">
                    Tracking eye position and attention state...
                    <br />
                    <span className="text-sm">Updates every 5 seconds</span>
                  </p>
                </div>
              </div>

              {/* Metrics display */}
              <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Tracking Metrics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <div className="text-gray-500">Eye Openness</div>
                    <div>{metrics.eyeOpenness.toFixed(3)}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Head Angle</div>
                    <div>{metrics.headOrientation.toFixed(1)}°</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5 mt-5 flex flex-col justify-between  md:flex-row md:items-start">
                <h4 className="ml-1 text-3xl font-bold text-navy-700 dark:text-white">
                  Key Takeaways
                </h4>
              </div>

              <div>
                {roomdetail.map((topic, index) => (
                  <div
                    key={index}
                    className="flex flex-col space-y-5 drop-shadow-sm"
                  >
                    <p className="text-gray-700 text-md bg-white p-3 drop-shadow-sm my-2 rounded-lg">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
