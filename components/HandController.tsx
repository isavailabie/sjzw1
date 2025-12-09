import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setHandFactor, nextShape } = useStore();
  const [loaded, setLoaded] = useState(false);
  
  // Ref to track previous state for trigger logic
  const stateRef = useRef({
    isClosed: false,
    lastTriggerTime: 0
  });
  
  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
           const stream = await navigator.mediaDevices.getUserMedia({
             video: {
               facingMode: "user",
               width: 640,
               height: 480
             }
           });
           
           if (videoRef.current) {
             videoRef.current.srcObject = stream;
             videoRef.current.addEventListener('loadeddata', predictWebcam);
             setLoaded(true);
           }
        }
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
      }
    };

    let lastVideoTime = -1;

    const predictWebcam = () => {
      if (handLandmarker && videoRef.current && videoRef.current.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current.currentTime;
        const startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks) {
          processLandmarks(results.landmarks);
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    const processLandmarks = (landmarks: any[]) => {
      // Calculate a "Spread Factor"
      let currentFactor = 1.0;

      if (landmarks.length > 0) {
        // Use the first hand found
        const hand = landmarks[0];
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const wrist = hand[0];

        // 1. Calculate distance between thumb and index (Pinch detection)
        const pinchDist = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // 2. Calculate hand span (Thumb tip to Pinky tip)
        const pinkyTip = hand[20];
        const spanDist = Math.sqrt(
          Math.pow(thumbTip.x - pinkyTip.x, 2) + 
          Math.pow(thumbTip.y - pinkyTip.y, 2)
        );

        // Mapping: 
        // Pinch/Fist (Closed) -> pinchDist < 0.05
        // Open Hand -> spanDist > 0.15

        // Visualize factor for scale (just for visual effect)
        // Map span 0.1 -> 0.4  to  0.8 -> 1.5
        currentFactor = 0.8 + (spanDist * 2);
        
        // --- TRIGGER LOGIC ---
        const now = Date.now();
        const COOLDOWN = 1000; // 1 second between switches

        const isHandClosed = pinchDist < 0.06 || spanDist < 0.15;
        const isHandOpen = spanDist > 0.25;

        // Logic: If we were Closed, and now we are Open -> TRIGGER
        if (stateRef.current.isClosed && isHandOpen) {
          if (now - stateRef.current.lastTriggerTime > COOLDOWN) {
            console.log("TRIGGER NEXT SHAPE");
            nextShape();
            stateRef.current.lastTriggerTime = now;
          }
        }

        // Update state
        if (isHandClosed) stateRef.current.isClosed = true;
        else if (isHandOpen) stateRef.current.isClosed = false;
      }
      
      // Still update the smooth zoom factor for visual feedback
      setHandFactor(Math.max(0.5, Math.min(currentFactor, 2.0)));
    };

    setup();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [setHandFactor, nextShape]);

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
       <video 
         ref={videoRef} 
         autoPlay 
         playsInline
         muted
         className="w-32 h-24 rounded-lg border border-white/20 transform scale-x-[-1]"
       />
       {!loaded && <div className="text-xs text-white absolute top-0 left-0 bg-black/50 p-1">Init Camera...</div>}
    </div>
  );
};

export default HandController;