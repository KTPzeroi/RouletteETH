"use client";
import React, { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers"; // เพิ่มการ import Web3Provider จาก ethers

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // ใช้สถานะเพื่อควบคุมการแสดงผลของ modal

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

  // ฟังก์ชันเปิด/ปิด modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

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
            {/* ปรับขนาดปุ่ม "How to play" ให้เท่าเดิม */}
            <button
              onClick={toggleModal}
              className="m-6 p-3 bg-zinc-950 font-medium rounded-lg text-center"
            >
              How to play 💡
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
  <div className="modal modal-open">
    <div className="modal-box text-white rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-4">How to Play</h2>
      <p className="text-lg mb-4">
        Follow these simple steps to get started:
      </p>
      <ol className="list-decimal list-inside text-lg space-y-2">
        <li>Connect your wallet.</li>
        <li>Deposit into your balance.</li>
        <li>Click Start to Play.</li>
        <li>Get your Reward (If you win).</li>
      </ol>
      <div className="modal-action justify-end">
        <button
          onClick={toggleModal}
          className="btn btn-primary bg-red-950 hover:bg-red-800 text-white border-2 border-red-700 rounded-lg px-6 py-3 text-lg"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Navbar;
