'use client';
import React, { useEffect, useState } from 'react';
import TruckChart from './TruckSimulation.jsx';
import Terminal from './Terminal.jsx';
import ConnectWallet from './wallet/connectWallet.jsx';
import JwtAuth from '../jwtAuth.jsx';
import { Vortex } from '../ui/Vortex.jsx';

const Home = () => {
  const [start, setStart] = useState(false);
  const [faulty, setfaulty] = useState(false);
  const [count, setCount] = useState(0);
  const [landing, setLanding] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);
  const [swap, setSwap] = useState(false);
  console.log(JSON.parse(sessionStorage.getItem('neighbours')!));
  useEffect(() => {
    if (start) {
      setLanding(false);
    }
  }, [start]);

  // useEffect(() => {
  //   const hasVisited = sessionStorage.getItem("visited");
  //   if (!hasVisited && !start) {
  //     sessionStorage.setItem("visited", "true");
  //     setLanding(true);
  //   } else {
  //     setLanding(false);
  //   }
  // }, []);

  return (
    <div className="flex w-full h-screen items-center justify-center flex-col p-12">
      <div className="flex">
        <ConnectWallet />
        <JwtAuth setAuthStatus={setAuthStatus} />
      </div>

      {landing ? (
        <Landing />
      ) : (
        <div>
          <TruckChart
            start={start}
            count={count}
            setCount={setCount}
            setSwap={setSwap}
            swap={swap}
            faulty={faulty}
            setfaulty={setfaulty}
          />
        </div>
      )}
      {authStatus && (
        <div className="w-10/12">
          <Terminal
            setSwap={setSwap}
            swap={swap}
            setStart={setStart}
            setfaulty={setfaulty}
            count={count}
            setCount={setCount}
            start={start}
          />
        </div>
      )}
    </div>
  );
};

export default Home;

const Landing = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-white">
      <div className="relative w-5/6 h-5/6 border border-gray-200 ">
        <Vortex containerClassName="absolute inset-0" className="rounded-xl" />

        <div className="flex flex-col justify-center items-center text-white z-10 absolute inset-0 ">
          <p className="font-bold">Welcome to</p>
          <p className="text-4xl font-bold ">ZK-Platoon</p>
          <p className="">enter</p>
          <p className="text-5xl font-bold ">start</p>
          <p className="font-bold pt-2">to visualize the zk-platoon simulation</p>
        </div>
      </div>
    </div>
  );
};
