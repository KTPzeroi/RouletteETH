"use client";
import React, { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers"; // เพิ่มการ import Web3Provider จาก ethers

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // เช็คว่า MetaMask หรือ wallet อื่นๆ ถูกติดตั้งหรือไม่
    if (window.ethereum) {
      // เมื่อเว็บโหลดเสร็จ ให้เชื่อมต่อกับ Ethereum
      const provider = new Web3Provider(window.ethereum); // ใช้ Web3Provider จาก ethersproject/providers
      const getWalletAddress = async () => {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      };

      // ขออนุญาตให้เชื่อมต่อกับ MetaMask
      provider.send("eth_requestAccounts", []).then(getWalletAddress);
    } else {
      console.log("Please install MetaMask!");
    }
  }, []);

  return (
    <div className="items-center flex justify-center bg-red-950">
      <div className="container">
        <div className="nav flex justify-between">
          <div className="logo flex items-center">
            <p className="mr-5 text-2xl">🔫</p>
            <p className="text-2xl font-bold">Crimson Chamber</p>
          </div>
          <div className="flex items-center justify-center text-lg">
            <div className="flex bg-zinc-950 px-4 py-2 rounded-xl">
              <p>Your Wallet Address:</p>
              <p className="ml-2">
                {walletAddress ? walletAddress : "Not Connected"}
              </p>
            </div>
          </div>
          <div className="content flex items-center">
            <a
              className="m-6 p-3 bg-zinc-950 font-medium rounded-lg text-center"
              href=""
            >
              Play 🎮
            </a>
            <a
              className="p-3 bg-zinc-950 font-medium rounded-lg text-center"
              href=""
            >
              How to play 💡
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
