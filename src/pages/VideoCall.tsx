import React, { useEffect, useRef, useState } from "react";

// Frontend-only WebRTC mock
// - No server/signaling: we create two RTCPeerConnections in-page (pc1 ↔ pc2)
// - Shows local preview and a "remote" stream produced by the loopback peer
// - Start/End call, toggle mic/camera, optional screen share

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const pc1Ref = useRef<RTCPeerConnection | null>(null); // caller
  const pc2Ref = useRef<RTCPeerConnection | null>(null); // callee (loopback)

  const [isCalling, setIsCalling] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- helpers ----
  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  const cleanUpConnections = () => {
    pc1Ref.current?.getSenders().forEach((s) => {
      try { s.replaceTrack(null); } catch {}
    });
    pc2Ref.current?.getSenders().forEach((s) => {
      try { s.replaceTrack(null); } catch {}
    });
    pc1Ref.current?.close();
    pc2Ref.current?.close();
    pc1Ref.current = null;
    pc2Ref.current = null;
  };

  const resetVideos = () => {
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // ---- actions ----
  const startCall = async () => {
    setError(null);
    try {
      // 1) get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // inline autoplay policies
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }

      // 2) create peer connections
      const pc1 = new RTCPeerConnection();
      const pc2 = new RTCPeerConnection();
      pc1Ref.current = pc1;
      pc2Ref.current = pc2;

      // 3) wire ICE candidates locally (mock signaling)
      pc1.onicecandidate = (e) => {
        if (e.candidate) pc2.addIceCandidate(e.candidate).catch(() => {});
      };
      pc2.onicecandidate = (e) => {
        if (e.candidate) pc1.addIceCandidate(e.candidate).catch(() => {});
      };

      // 4) when pc2 receives tracks, set remote video
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      pc2.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => {});
        }
      };

      // 5) add local tracks to pc1
      stream.getTracks().forEach((track) => {
        pc1.addTrack(track, stream);
      });

      // 6) offer/answer
      const offer = await pc1.createOffer();
      await pc1.setLocalDescription(offer);
      await pc2.setRemoteDescription(offer);

      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);
      await pc1.setRemoteDescription(answer);

      setIsCalling(true);
      setMicEnabled(true);
      setCamEnabled(true);
    } catch (err: any) {
      setError(err?.message || "Failed to start call. Check camera/mic permissions.");
      endCall();
    }
  };

  const endCall = () => {
    stopStream(localStreamRef.current);
    stopStream(remoteStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    cleanUpConnections();
    resetVideos();
    setIsCalling(false);
    setIsScreenSharing(false);
  };

  const toggleMic = () => {
    const enabled = !micEnabled;
    setMicEnabled(enabled);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = enabled));
  };
<video 
  className="w-full h-64 bg-black rounded-lg"
  autoPlay 
  loop 
  muted
>
  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
  Your browser does not support video.
</video>
  const toggleCamera = () => {
    const enabled = !camEnabled;
    setCamEnabled(enabled);
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = enabled));
  };

  const startScreenShare = async () => {
    try {
      if (!pc1Ref.current) return;
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      const screenTrack = displayStream.getVideoTracks()[0];

      // replace the outgoing video track on pc1
      const sender = pc1Ref.current.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);

      // also show locally
      const local = localStreamRef.current;
      if (local) {
        // stop old camera track visually and attach screen to local video
        local.getVideoTracks().forEach((t) => t.stop());
        const newLocal = new MediaStream([screenTrack]);
        localVideoRef.current && (localVideoRef.current.srcObject = newLocal);
      }

      setIsScreenSharing(true);

      screenTrack.onended = async () => {
        await stopScreenShare();
      };
    } catch (e) {
      setError("Screen share failed or was cancelled.");
    }
  };

  const stopScreenShare = async () => {
    if (!pc1Ref.current) return;
    try {
      // get camera again
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const camTrack = camStream.getVideoTracks()[0];
      const sender = pc1Ref.current.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) await sender.replaceTrack(camTrack);

      // restore local preview
      const base = localStreamRef.current || new MediaStream();
      const newLocal = new MediaStream([camTrack, ...base.getAudioTracks()]);
      localStreamRef.current = newLocal;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newLocal;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }
    } catch (e) {
      // if user denies camera after screenshare, just stop sharing state
    }
    setIsScreenSharing(false);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      endCall();
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Video Calling (Mock)</h1>
        <div className="text-sm text-gray-500">WebRTC loopback demo – no backend required</div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2">{error}</div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {!isCalling ? (
          <button onClick={startCall} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow">
            Start Call
          </button>
        ) : (
          <button onClick={endCall} className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow">
            End Call
          </button>
        )}

        <button
          onClick={toggleMic}
          disabled={!isCalling}
          className={`px-4 py-2 rounded-xl shadow ${isCalling ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-200 text-gray-500"}`}
        >
          {micEnabled ? "Mute" : "Unmute"}
        </button>

        <button
          onClick={toggleCamera}
          disabled={!isCalling}
          className={`px-4 py-2 rounded-xl shadow ${isCalling ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-200 text-gray-500"}`}
        >
          {camEnabled ? "Turn Camera Off" : "Turn Camera On"}
        </button>

        {!isScreenSharing ? (
          <button
            onClick={startScreenShare}
            disabled={!isCalling}
            className={`px-4 py-2 rounded-xl shadow ${isCalling ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500"}`}
          >
            Share Screen
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            disabled={!isCalling}
            className={`px-4 py-2 rounded-xl shadow ${isCalling ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500"}`}
          >
            Stop Sharing
          </button>
        )}
      </div>

      {/* Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow">
          <video ref={localVideoRef} playsInline autoPlay className="w-full h-full object-cover" />
        </div>
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow">
          <video ref={remoteVideoRef} playsInline autoPlay className="w-full h-full object-cover" />
        </div>
      </div>

      <ul className="text-sm text-gray-600 list-disc ml-5">
        <li>Works on HTTPS origins (or localhost) due to browser media permissions.</li>
        <li>This is a frontend-only mock: it loops a local peer to a remote peer in-page.</li>
        <li>Integrate a real signaling server (WebSocket) later for multi-user calls.</li>
      </ul>
    </div>
  );
}
