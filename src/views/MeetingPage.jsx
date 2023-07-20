import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import OnlineList from "../components/OnlineList";
import Chat from "../components/Chat";
import New from "./New";

const socket = io.connect("http://localhost:8000");

const MeetingPage = () => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [idToCall, setIdToCall] = useState();
  const [recvCall, setRecvCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [caller, setCaller] = useState();
  const [name, setName] = useState();
  const [callerSignal, setCallerSignal] = useState();

  const myVid = useRef();
  const remVid = useRef();
  const connRef = useRef();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVid.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });
    socket.on("callUser", (data) => {
      setRecvCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (stream) => {
      remVid.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      remVid.current.srcObject = stream;
    });
    peer.signal(callerSignal);
    connRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(false);
    connRef.current.destroy();
  };

  return (
    <div className="flex flex-wrap p-3 justify-between">
      <div className="onlinelist">
        <OnlineList />
      </div>
      <div className="campart w-700">
        <div className="bg-gray-800 rounded-xl p-3">
          {callAccepted && !callEnded ? (
            <video playsInline muted ref={remVid} width="575px" autoPlay />
          ) : (
            <img src="https://i.pravatar.cc/500" alt="" loading="lazy" />
          )}
        </div>
        <br></br>
        <div className="flex bg-gray-800 rounded-xl p-2 place-content-around">
          {stream ? (
            <video playsInline muted ref={myVid} width="300px" autoPlay />
          ) : (
            <img src="https://i.pravatar.cc/300" alt="" loading="lazy" />
          )}
          <div className="text-white">
            Leslie Online & Selected
            <br></br>
            {callAccepted && !callEnded ? (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded"
                onClick={leaveCall}
              >
                End Call
              </button>
            ) : (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                onClick={() => callUser(idToCall)}
              >
                Call
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center min-h-99 bg-gray-100 text-gray-800 p-10">
        <New />
      </div>
    </div>
  );
};

export default MeetingPage;
