import { useEffect, useState } from "react";

const Chat = ({ socket, mySocketId, remoteUser }) => {
  const [myText, setMyText] = useState("");
  const [textRecords, setTextRecords] = useState([]);

  useEffect(() => {
    setTextRecords([]);
  }, [remoteUser]);

  useEffect(() => {
    socket.on("recMsg", (msg) => {
      setTextRecords((textRecords) => [
        ...textRecords,
        {
          from: "other",
          text: msg.txt,
          time: new Date(),
        },
      ]);
    });
  }, [socket]);

  function handleMessageSend() {
    socket.emit("sendMsg", {
      from: mySocketId,
      txt: myText,
      to: remoteUser,
    });
    setTextRecords((textRecords) => [
      ...textRecords,
      {
        from: "me",
        text: myText,
        time: new Date(),
      },
    ]);
    setMyText("");
  }

  const handleTimeConverter = (diff) => {
    const timeDiffMs = Math.abs(diff);
    if (0 < timeDiffMs && timeDiffMs < 1000) {
      return "Just Now";
    } else if (1000 < timeDiffMs && timeDiffMs < 60000) {
      return `${Math.round(timeDiffMs / 1000)} Secs ago`;
    } else if (6000 < timeDiffMs && timeDiffMs < 3600000) {
      return `${Math.round(timeDiffMs / 60000)} Mins ago`;
    }
  };

  return (
    <div className="flex flex-col flex-grow bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="bg-gray-300 p-4">
        TO : {remoteUser ? remoteUser : "Waiting for connection"}
      </div>
      <div
        className="flex flex-col flex-grow h-0 p-4 overflow-auto"
        key={Math.random() * 3}
      >
        <div className="flex w-full mt-2 space-x-3 max-w-xs">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
          <div>
            <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
              <p className="text-sm">Waiting for someone to Connect.</p>
            </div>
            <span className="text-xs text-gray-500 leading-none">
              2 min ago
            </span>
          </div>
        </div>

        {textRecords.map((msg, index) => {
          return msg.from === "me" ? (
            <div
              key={index}
              className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end"
            >
              <div>
                <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 leading-none">
                  {handleTimeConverter(new Date() - msg.time)}
                </span>
              </div>
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
            </div>
          ) : (
            <div key={index} className="flex w-full mt-2 space-x-3 max-w-xs">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
              <div>
                <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 leading-none">
                  {handleTimeConverter(new Date() - msg.time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex bg-gray-300 p-4">
        <input
          className="items-center h-10 w-full rounded px-3 text-sm"
          type="text"
          value={myText}
          placeholder="Type your message…"
          onChange={(e) => {
            setMyText(e.target.value);
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  rounded"
          onClick={() => {
            handleMessageSend();
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
