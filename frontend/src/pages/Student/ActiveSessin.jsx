import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const EyeBasedAttentionTracker = () => {
  // Core refs for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [modelStatus, setModelStatus] = useState("loading");
  const [attentionState, setAttentionState] = useState("initializing");
  const [metrics, setMetrics] = useState({
    eyeOpenness: 0,
    headOrientation: 0,
    lastUpdate: null,
  });

  const CONFIG = {
    updateInterval: 5000, // Check every 5 seconds as requested
    thresholds: {
      earThreshold: 0.22, // Eye aspect ratio threshold for closed eyes
      headAngleMin: 170, // Minimum acceptable head angle
      headAngleMax: 190, // Maximum acceptable head angle
    },
  };

  // Setup tracking on component mount
  useEffect(() => {
    let trackingTimer = null;

    const setupTracking = async () => {
      try {
        await startCamera();

        // Start periodic tracking every 5 seconds
        trackingTimer = setInterval(analyzeAttention, 1000);
      } catch (error) {
        console.error("Setup error:", error);
        setModelStatus("error");
      }
    };

    setupTracking();

    // Cleanup function
    return () => {
      if (trackingTimer) clearInterval(trackingTimer);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        setModelStatus("loading");

        const MODEL_URL = "/weights";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);

        if (isMounted) {
          setModelStatus("ready");
          console.log("done");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setModelStatus("error");
      }
    };

    loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

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
    console.log(modelStatus, !videoRef.current);
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

      // Determine attention state based on metrics
      const { earThreshold, headAngleMin, headAngleMax } = CONFIG.thresholds;

      // Eyes closed check
      const eyesClosed = avgEAR < earThreshold;

      // Head orientation check (looking away)
      const headMisaligned =
        headAngle < headAngleMin || headAngle > headAngleMax;

      // Determine final state
      let newState;
      console.log(eyesClosed);
      if (headAngle > 340 && headAngle <= 370 && avgEAR < 0.3) {
        newState = "focused";
      } else if (avgEAR > 0.3) {
        newState = "unfocused";
      } else {
        newState = "sleepy";
      }

      setAttentionState(newState);
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

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-3">Attention Monitor</h1>

      {modelStatus === "error" && (
        <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          Failed to load attention tracking model. Please check your internet
          connection and try again.
        </div>
      )}

      {/* Status indicator */}
      <div className="mb-4 w-full flex items-center">
        <div className={`w-4 h-4 rounded-full mr-2 ${getStateColor()}`}></div>
        <span className="font-medium">
          Status:{" "}
          {attentionState.charAt(0).toUpperCase() + attentionState.slice(1)}
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
    </div>
  );
};

export default EyeBasedAttentionTracker;
