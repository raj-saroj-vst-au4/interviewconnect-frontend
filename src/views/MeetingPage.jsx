import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import OnlineList from "../components/OnlineList";
import Chat from "../components/Chat";
import Modal from "../components/Modal";

const socket = io.connect("https://interviewconnect-backend-4a27.onrender.com");
// const socket = io.connect("http://localhost:8000");

const MeetingPage = () => {
  const [mySocketId, setMySocketId] = useState("");
  const [hideModal, setHideModal] = useState(true);
  const [modalData, setModalData] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [myPeer, setMyPeer] = useState();
  const [remPeer, setRemPeer] = useState();
  const [remoteUser, setRemoteUser] = useState("");
  const [callStatus, setCallStatus] = useState(false);

  const myVid = useRef();
  const remVid = useRef();
  const peerInstance = useRef();

  useEffect(() => {
    socket.on("me", (id) => {
      setMySocketId(id);
    });

    const peer = new Peer();

    peer.on("open", (id) => {
      setMyPeer(id);
      console.log("my peer id", id);
    });

    peer.on("call", (call) => {
      startMyStream().then((stream) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  useEffect(() => {
    if (myVid.current) {
      myVid.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remVid.current) {
      remVid.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    socket.on("vcEnd", leaveCall);
  }, [socket]);

  const startMyStream = async () => {
    //khudka stream on
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    setCallStatus(true);
    return stream;
  };

  const handleCallUser = async () => {
    startMyStream().then((myStream) => {
      console.log("rempeer in handlecall", remPeer, myStream);
      const call = peerInstance.current.call(remPeer, myStream);
      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });
    });
  };

  const leaveCall = () => {
    console.log("call disconnected");
    myStream?.getTracks().forEach((track) => {
      if (track.readyState == "live") {
        track.stop();
      }
    });
    setCallStatus(false);
    setMyStream(null);
  };

  //Donot touch below
  socket.on("invite", (data) => {
    setHideModal(false);
    setModalData(data);
  });

  const toggleModal = () => {
    return setHideModal(!hideModal);
  };

  return (
    <div className="grid grid-cols-5 gap-2 bg-gray-100 h-fit">
      <div className="modal absolute">
        <Modal
          socket={socket}
          toggleModal={toggleModal}
          hideModal={hideModal}
          modalData={modalData}
          setRemoteUser={setRemoteUser}
          remoteUser={remoteUser}
          myPeer={myPeer}
          setRemPeer={setRemPeer}
        />
      </div>

      <div className="col-span-1">
        <OnlineList
          socket={socket}
          mySocketId={mySocketId}
          setRemoteUser={setRemoteUser}
          myPeer={myPeer}
          setRemPeer={setRemPeer}
        />
      </div>
      <div className="col-span-3">
        <div className="sticky bg-gray-800 rounded-xl p-3 w-1200 h-800 m-5 shadow-xl">
          <div className="absolute inline-block text-white top-5 left-5">
            <br></br>
            My Socket: {mySocketId}
            <br></br>
            Rem Socket : {remoteUser}
            <br></br>
          </div>
          {callStatus ? (
            <video playsInline muted ref={remVid} width="1100px" autoPlay />
          ) : (
            <img src="https://picsum.photos/1100/800" alt="" loading="lazy" />
          )}
          <div className="absolute rounded-lg bottom-5 right-5 w-100 h-100 shadow-xl overflow-hidden">
            {myStream ? (
              <video playsInline muted ref={myVid} width="200px" autoPlay />
            ) : (
              <img src="https://i.pravatar.cc/250" alt="" loading="lazy" />
            )}
          </div>
          <div className="text-white text-center absolute bottom-5 left-10">
            {callStatus ? (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded"
                onClick={() => {
                  leaveCall();
                  socket.emit("vcEnd", remoteUser);
                }}
              >
                End Call
              </button>
            ) : (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                onClick={handleCallUser}
              >
                Start VideoCall
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col col-span-1 items-center justify-center text-gray-800 pt-5 pb-5 h-full">
        <Chat
          socket={socket}
          mySocketId={mySocketId}
          remoteUser={remoteUser}
          setRemoteUser={setRemoteUser}
        />
      </div>
    </div>
  );
};

export default MeetingPage;
