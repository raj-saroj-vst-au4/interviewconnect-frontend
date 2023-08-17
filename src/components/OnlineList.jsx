import React, { useEffect, useState } from "react";

const OnlineList = ({
  socket,
  mySocketId,
  setRemoteUser,
  remoteUser,
  myPeer,
  setRemPeer,
}) => {
  const [peoples, setPeoples] = useState([]);

  useEffect(() => {
    socket.on("serverliveList", async (livelist) => {
      const peeps = livelist
        .filter(async (id) => {
          return id !== mySocketId;
        })
        .map(async (id) => {
          const userData = await fetch(
            "https://randomuser.me/api/?results=1&inc=name,gender,nat,email&noinfo",
            {
              mode: "cors",
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }
          ).then((res) => res.json());

          return {
            name: userData.results[0].name.first,
            email: userData.results[0].email,
            role: userData.results[0].gender,
            dp: "https://i.pravatar.cc/300",
            socket: id,
            status: remoteUser === id ? "Connected" : "Initiate",
          };
        });

      const updatedPeoples = await Promise.all(peeps);
      setPeoples(updatedPeoples);
    });

    socket.on("invAcc", (invData) => {
      setRemoteUser(invData.to);
      setRemPeer(invData.remPeer);
      setPeoples((prevPeoples) =>
        prevPeoples.map((person) =>
          person.socket === invData.to
            ? { ...person, status: "Connected" }
            : person
        )
      );
      console.log(invData.peer, " p2p connected ", invData.remPeer);
    });
  }, [socket]);

  const handleSwitch = (sid) => {
    socket.emit("invite", {
      from: mySocketId,
      to: sid,
      peer: myPeer,
    });
    setPeoples((prevPeoples) =>
      prevPeoples.map((person) =>
        person.socket === sid ? { ...person, status: "Waiting" } : person
      )
    );
  };

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold text-gray-900 text-center mt-3">
        People Online
      </h2>
      {peoples.length === 0 && <div className="text-center">Nobody Online</div>}
      <ul role="list" className="divide-y divide-gray-100">
        {peoples.map((person) =>
          person.socket !== mySocketId ? (
            <li
              key={person.socket}
              className="flex justify-between gap-x-6 p-5"
            >
              <div className="flex gap-x-4">
                <img
                  className="h-12 w-12 flex-none rounded-full bg-gray-50"
                  src={person.dp}
                  alt=""
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {person.name}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                    {person.socket}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <p className="text-sm leading-6 text-gray-900">{person.role}</p>

                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs leading-5 text-gray-500">Online</p>
                </div>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleSwitch(person.socket)}
              >
                {person?.status}
              </button>
            </li>
          ) : (
            ""
          )
        )}
      </ul>
    </>
  );
};

export default OnlineList;
