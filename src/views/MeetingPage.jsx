import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import peer from "./../service/peer";
import OnlineList from "../components/OnlineList";
import Chat from "../components/Chat";
import Modal from "../components/Modal";

const socket = io.connect("http://192.168.1.113:8000");

const MeetingPage = () => {
  const [mySocketId, setMySocketId] = useState("");
  const [myStream, setMyStream] = useState();
  const [remoteUser, setRemoteUser] = useState();
  const [hideModal, setHideModal] = useState(true);
  const [modalData, setModalData] = useState();
  const [callStatus, setCallStatus] = useState(false);

  const myVid = useRef();
  const remVid = useRef();
  const connRef = useRef();
  useEffect(() => {
    socket.on("me", (id) => {
      setMySocketId(id);
    });
  }, []);

  useEffect(() => {
    if (myVid.current) {
      myVid.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    socket.on("vcIncoming", async ({ from, offer }) => {
      const answer = await peer.setOffer(offer);
      startMyStream();
      socket.emit("vcStart", { from: mySocketId, to: from, answer });
    });

    socket.on("vcStart", ({ from, to, answer }) => {
      peer.setLocalDescription(answer);

      peer.ontrack = (event) => {
        console.log(event.streams[0]);
        remVid.current.srcObj = event.streams[0];
      };
      setCallStatus(true);
    });

    socket.on("vcEnd", () => {
      leaveCall();
    });
  }, [socket]);

  socket.on("invite", (data) => {
    setHideModal(false);
    setModalData(data);
  });

  const toggleModal = () => {
    return setHideModal(!hideModal);
  };

  const startMyStream = async () => {
    //khudka stream on
    await navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((myStream) => {
        setMyStream(myStream);
      });
    setCallStatus(true);
  };

  const callUser = async () => {
    startMyStream();
    const offer = await peer.getOffer();
    socket.emit("callUser", { from: mySocketId, to: remoteUser, offer });
  };

  const leaveCall = () => {
    myStream.getTracks().forEach((track) => {
      if (track.readyState == "live") {
        track.stop();
      }
    });
    setCallStatus(false);
    setMyStream(null);
    socket.emit("vcEnd", { from: mySocketId, to: remoteUser });
  };
  return (
    <div className="flex flex-wrap p-3 justify-between bg-gray-100">
      <Modal
        socket={socket}
        toggleModal={toggleModal}
        hideModal={hideModal}
        modalData={modalData}
        setRemoteUser={setRemoteUser}
        remoteUser={remoteUser}
      />
      <div className="onlinelist">
        <OnlineList
          socket={socket}
          mySocketId={mySocketId}
          setRemoteUser={setRemoteUser}
        />
      </div>
      <div className="campart w-700">
        <div className="bg-gray-800 rounded-xl p-3">
          {callStatus ? (
            <video playsInline muted ref={remVid} width="575px" autoPlay />
          ) : (
            <img src="https://i.pravatar.cc/500" alt="" loading="lazy" />
          )}
        </div>
        <br></br>
        <div className="flex bg-gray-800 rounded-xl p-2">
          {myStream ? (
            <video playsInline muted ref={myVid} width="400px" autoPlay />
          ) : (
            <img src="https://i.pravatar.cc/300" alt="" loading="lazy" />
          )}
          <div className="text-white text-center">
            <br></br>
            My Socket: {mySocketId}
            <br></br>
            Rem Socket : {remoteUser}
            <br></br>
            {callStatus ? (
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
                onClick={callUser}
              >
                Start VideoCall
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center min-h-9 text-gray-800 p-10">
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
