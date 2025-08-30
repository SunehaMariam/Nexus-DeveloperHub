import React, { useState, useRef } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff,Monitor } from "lucide-react";

const VideoCall: React.FC = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const startCall = async () => {
    setIsCallActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera/Mic access denied", err);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    if (localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream).getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isVideoOn;
    }
  };

  const toggleAudio = () => {
    setIsAudioOn((prev) => !prev);
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream).getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !isAudioOn;
    }
  };
// Screen Share
  const startScreenShare = async () => {
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
    } catch (error) {
      console.error("Error sharing screen.", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 text-white rounded-2xl shadow-xl p-4">
        {/* Video Box */}
        <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
          {isCallActive ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Video className="w-12 h-12" />
              <p className="mt-2">Your video will appear here</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="bg-green-600 hover:bg-green-700 rounded-full px-6 py-3 text-white font-semibold shadow-lg transition"
            >
              Start Call
            </button>
          ) : (
            <>
              <button
                onClick={toggleVideo}
                className="bg-gray-700 hover:bg-gray-600 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition"
              >
                {isVideoOn ? <Video /> : <VideoOff />}
              </button>

              <button
                onClick={toggleAudio}
                className="bg-gray-700 hover:bg-gray-600 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition"
              >
                {isAudioOn ? <Mic /> : <MicOff />}
              </button>

              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition"
              >
                <PhoneOff />
              </button>
               <button
          onClick={startScreenShare}
          className="p-4 bg-blue-500 rounded-full hover:bg-blue-600 shadow-lg"
        >
          <Monitor size={24} />
        </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
