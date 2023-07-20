import React, { useEffect, useState } from "react";

const OnlineList = ({ socket, mySocketId, setRemoteUser }) => {
  const [peoples, setPeoples] = useState([]);

  useEffect(() => {
    socket.on("serverliveList", async (livelist) => {
      const promises = livelist.map(async (id) => {
        if (id !== mySocketId) {
          const userData = await fetch(
            "https://randomuser.me/api/?results=1&inc=name,gender,nat,email&noinfo"
          ).then((res) => res.json());

          return {
            name: userData.results[0].name.first,
            email: userData.results[0].email,
            role: userData.results[0].gender,
            socket: id,
          };
        }
      });

      const updatedPeoples = await Promise.all(promises);
      setPeoples(updatedPeoples);
    });
  }, []);

  const handleRefreshList = () => {
    console.log(data);
  };

  socket.on("invAcc", (invData) => {
    setRemoteUser(invData.to);
  });

  const handleSwitch = (sid) => {
    socket.emit("invite", {
      from: mySocketId,
      to: sid,
    });
  };

  return (
    <>
      <ul role="list" className="divide-y divide-gray-100">
        {peoples.map((person) => (
          <li key={person.email} className="flex justify-between gap-x-6 py-5">
            <div className="flex gap-x-4">
              <img
                className="h-12 w-12 flex-none rounded-full bg-gray-50"
                src="https://i.pravatar.cc/300"
                alt=""
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {person.name}
                </p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                  {person.email}
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  rounded"
              onClick={() => handleSwitch(person.socket)}
            >
              Initiate
            </button>
          </li>
        ))}
      </ul>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  rounded"
        onClick={handleRefreshList}
      >
        Refresh List
      </button>
    </>
  );
};

export default OnlineList;
