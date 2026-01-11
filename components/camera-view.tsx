"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, Upload, Image as ImageIcon, Play } from "lucide-react";

export default function CameraView({ onMoodChange }: { onMoodChange?: (mood: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [mode, setMode] = useState<'camera' | 'upload'>('camera');
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [expression, setExpression] = useState<string>("");
    const [debugLog, setDebugLog] = useState<string>("Initializing AI...");
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                setDebugLog("Loading models...");
                const MODEL_URL = "/models";
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                setIsModelLoaded(true);
                setDebugLog("AI Ready! Choose mode.");
            } catch (error) {
                console.error("Model Error:", error);
                setDebugLog("Model load failed.");
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (mode === 'camera' && isModelLoaded && isCameraActive) {
            startVideo();
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [mode, isModelLoaded, isCameraActive]);

    const startVideo = () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setDebugLog("Camera not supported.");
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(() => setDebugLog("Camera denied."));
    };

    const handleVideoPlay = () => {
        if (mode !== 'camera' || !isCameraActive) return;
        setDebugLog("AI SCANNING...");
        const loop = async () => {
            if (!isCameraActive || !videoRef.current || !canvasRef.current || !isModelLoaded) return;
            if (videoRef.current.paused || videoRef.current.ended) { setTimeout(loop, 500); return; }

            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 });
            const detections = await faceapi.detectAllFaces(videoRef.current, options).withFaceLandmarks().withFaceExpressions();
            processDetections(detections, videoRef.current.videoWidth, videoRef.current.videoHeight);
            requestAnimationFrame(loop);
        };
        loop();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setExpression("");
                setDebugLog("PROCESSING...");
            };
            reader.readAsDataURL(file);
        }
    };

    // FIXED: Create an off-screen Image object for analysis
    useEffect(() => {
        if (!uploadedImage || !isModelLoaded) return;

        const analyzeImage = async () => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = async () => {
                try {
                    setDebugLog("AI ANALYZING FACE...");
                    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 });
                    const detections = await faceapi.detectAllFaces(img, options).withFaceLandmarks().withFaceExpressions();

                    console.log("Photo Detections:", detections);
                    processDetections(detections, img.width, img.height);
                } catch (err) {
                    console.error("AI Error:", err);
                    setDebugLog("AI ERROR.");
                }
            };
            img.onerror = () => setDebugLog("IMAGE LOAD ERROR");
            img.src = uploadedImage;
        };

        analyzeImage();
    }, [uploadedImage, isModelLoaded]);

    const processDetections = (detections: any[], srcWidth: number, srcHeight: number) => {
        if (detections.length > 0) {
            const emotions = detections[0].expressions;
            const validEmotions = ['happy', 'sad', 'angry'];
            const sorted = validEmotions
                .map(e => ({ expression: e, probability: (emotions as any)[e] as number }))
                .sort((a, b) => b.probability - a.probability);
            const bestMatch = sorted[0];

            setExpression(bestMatch.expression);
            setDebugLog(`DETECTED: ${bestMatch.expression.toUpperCase()} (${Math.round(bestMatch.probability * 100)}%)`);

            if (canvasRef.current) {
                const displaySize = { width: srcWidth, height: srcHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resized = faceapi.resizeResults(detections, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, srcWidth, srcHeight);
                    faceapi.draw.drawDetections(canvasRef.current, resized);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
                }
            }
        } else {
            setDebugLog("NO FACE FOUND. TRY ANOTHER.");
            setExpression("");
        }
    };

    const handleCapture = () => {
        if (expression && onMoodChange) {
            setDebugLog("VIBE CAPTURED!");
            onMoodChange(expression);
        } else {
            setDebugLog("NEED FACE FIRST!");
        }
    };

    return (
        <div className="relative border-4 border-black p-2 bg-black shadow-brutal w-full max-w-[640px] mx-auto">
            <div className="flex gap-2 mb-2">
                <button onClick={() => { setMode('camera'); setIsCameraActive(false); }} className={`flex-1 font-bold py-2 border-2 border-black flex items-center justify-center gap-2 ${mode === 'camera' ? 'bg-vibeflow-yellow' : 'bg-gray-200'}`}>
                    <Camera className="w-4 h-4" /> LIVE CAM
                </button>
                <button onClick={() => setMode('upload')} className={`flex-1 font-bold py-2 border-2 border-black flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-vibeflow-blue text-white' : 'bg-gray-200'}`}>
                    <Upload className="w-4 h-4" /> UPLOAD FOTO
                </button>
            </div>

            <div className="relative overflow-hidden bg-gray-900 w-full aspect-video border-2 border-black">
                {mode === 'camera' ? (
                    <>
                        {isCameraActive ? (
                            <video ref={videoRef} autoPlay muted playsInline onPlay={handleVideoPlay} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                                <Camera className="w-16 h-16 mb-4 opacity-50" />
                                <button onClick={() => setIsCameraActive(true)} disabled={!isModelLoaded} className="bg-vibeflow-green text-black font-black text-xl px-8 py-3 border-4 border-black shadow-brutal hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2">
                                    {isModelLoaded ? <><Play className="fill-black" /> START CAMERA</> : "LOADING AI..."}
                                </button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />
                    </>
                ) : (
                    <div className="w-full h-full bg-vibeflow-yellow flex items-center justify-center relative">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer" />
                        {uploadedImage ? (
                            <img ref={imageRef} src={uploadedImage} className="w-full h-full object-contain" alt="Uploaded" />
                        ) : (
                            <div className="text-center p-6 border-4 border-black bg-white shadow-brutal pointer-events-none">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                <p className="font-black text-2xl uppercase">DROP PHOTO</p>
                                <p className="text-sm font-bold bg-black text-white inline-block px-2">OR CLICK</p>
                            </div>
                        )}
                    </div>
                )}
                {!isModelLoaded && <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black/90 z-50">LOADING BRAIN...</div>}
            </div>

            <div className="flex justify-between items-end mt-4 gap-4">
                <div className="flex-grow bg-white border-2 border-black p-2 shadow-brutal-sm">
                    <p className="font-mono text-xs font-bold text-gray-500">SYSTEM LOG</p>
                    <p className="font-bold text-sm uppercase truncate">{debugLog}</p>
                </div>
                <div className={`border-4 border-black px-4 py-2 shadow-brutal min-w-[120px] text-center ${expression === 'happy' ? 'bg-vibeflow-yellow' : ''} ${expression === 'sad' ? 'bg-vibeflow-blue text-white' : ''} ${expression === 'angry' ? 'bg-vibeflow-red text-white' : ''} ${!expression ? 'bg-gray-200' : ''}`}>
                    <p className="text-xl font-black uppercase tracking-tighter">{expression || '---'}</p>
                </div>
            </div>

            <button onClick={handleCapture} className="w-full mt-4 bg-vibeflow-green hover:bg-green-400 text-black border-4 border-black py-4 font-black text-2xl uppercase tracking-widest shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 group">
                <Camera className="w-8 h-8 group-hover:rotate-12 transition-transform" /> CREATE PLAYLIST
            </button>
        </div>
    );
}
