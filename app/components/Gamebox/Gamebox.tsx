"use client";
import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import Swal from "sweetalert2";

// or via CommonJS
const Swal = require("sweetalert2");

const Gamebox = () => {
  const [gameResult, setGameResult] = useState("");
  const [videoSrc, setVideoSrc] = useState(null);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [balance, setBalance] = useState(0);
  const [inputDeposit, setInputDeposit] = useState("");
  const [inputWithdraw, setInputWithdraw] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(""); // Added for error handling

  const videoRef = useRef(null);
  const contractAddress = "0x849b0BfA060CD83Dd9BD9Dfc0cB01e3aCB763D79"; // แก้ตรงนี้
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const savedAccount = localStorage.getItem("account");
    const savedBalance = localStorage.getItem("balance");

    if (savedAccount) {
      setAccount(savedAccount);
    }

    if (savedBalance && parseFloat(savedBalance) > 0) {
      setBalance(parseFloat(savedBalance));
    }
  }, []);

  useEffect(() => {
    if (account) {
      localStorage.setItem("account", account);
    }
    if (balance !== 0) {
      localStorage.setItem("balance", balance);
    }
  }, [account, balance]);

  useEffect(() => {
    if (window.ethereum) {
      const init = async () => {
        try {
          const _web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const _accounts = await _web3.eth.getAccounts();
          setWeb3(_web3);
          setAccount(_accounts[0]);

          // เก็บ account ใน localStorage
          localStorage.setItem("account", _accounts[0]);

          // เชื่อมต่อกับ smart contract
          const _contract = new _web3.eth.Contract( // แก้ตั้งแต่ข้างล่าง
            [
              {
                inputs: [],
                name: "deposit",
                outputs: [],
                stateMutability: "payable",
                type: "function",
              },
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                  },
                  {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "Deposit",
                type: "event",
              },
              {
                inputs: [
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "withdraw",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                  },
                  {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "Withdraw",
                type: "event",
              },
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "",
                    type: "address",
                  },
                ],
                name: "balances",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [],
                name: "checkBalance",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [],
                name: "contractBalance",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],

            contractAddress
          );
          setContract(_contract);

          // ดึงค่า balance จาก smart contract และเก็บไว้
          loadBalance(_contract);
        } catch (error) {
          setError("Failed to connect to Ethereum wallet.");
          console.error(error);
        }
      };
      init();
    } else {
      setError(
        "Ethereum is not detected. Please install MetaMask or another Ethereum wallet."
      );
    }
  }, []);

  const loadBalance = async (contract) => {
    if (contract && account) {
      try {
        const balance = await contract.methods
          .checkBalance()
          .call({ from: account });
        const ethBalance = web3.utils.fromWei(balance, "ether");

        if (ethBalance) {
          setBalance(ethBalance); // อัปเดตค่า Balance
          localStorage.setItem("balance", ethBalance); // เก็บ Balance ใน LocalStorage
        }
      } catch (error) {
        setError("Failed to load balance.");
        console.error(error);
      }
    }
  };

  const handleDeposit = async () => {
    if (inputDeposit <= 0) return;
    const depositAmount = web3.utils.toWei(inputDeposit, "ether");
    try {
      await contract.methods
        .deposit()
        .send({ from: account, value: depositAmount });

      // เรียก loadBalance หลังการฝากสำเร็จ
      await loadBalance(contract);
      setInputDeposit("");

      Swal.fire({
        title: "Success!",
        text: `You have successfully deposited ${inputDeposit} ETH.`,
        icon: "success",
      });
    } catch (error) {
      setError("Failed to deposit funds.");
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    if (!inputWithdraw) {
      alert("Please enter an amount to withdraw");
      return;
    }

    const amount = web3.utils.toWei(inputWithdraw, "ether");

    try {
      // เรียกฟังก์ชัน withdraw จาก Smart Contract
      await contract.methods.withdraw(amount).send({ from: account });

      // อัปเดตยอดคงเหลือหลังการถอน
      const userBalance = await contract.methods
        .checkBalance()
        .call({ from: account });
      setBalance(web3.utils.fromWei(userBalance, "ether"));

      // แปลง amount เป็น Ether เพื่อแสดงผลในข้อความ
      const amountInEth = web3.utils.fromWei(amount, "ether");

      Swal.fire({
        title: "Success!",
        text: `You have successfully withdrawn ${amountInEth} ETH.`,
        icon: "success",
      }).then(() => {
        // รีเฟรชหน้า
        window.location.reload();
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Failed to withdraw funds.",
        icon: "error",
      });
      window.location.reload();
    }
  };

  const handlePlayerTurn = () => {
    if (isVideoPlaying) return;
    const randomNumber = Math.random();
    if (randomNumber < 0.7) {
      setVideoSrc("/Video/pointPLAYER.mp4");
      setPendingResult(null);
      setIsVideoPlaying(true);
      setTimeout(() => {
        setIsBotTurn(true);
      }, 2000);
    } else {
      setVideoSrc("/Video/shootPLAYER.mp4");
      setPendingResult("lose");
      setIsVideoPlaying(true);
    }
  };

  const handleBotTurn = () => {
    if (isVideoPlaying) return;
    const randomNumber = Math.random();
    if (randomNumber < 0.7) {
      setVideoSrc("/Video/shootAI.mp4");
      setPendingResult("win");
      setIsVideoPlaying(true);
    } else {
      setVideoSrc("/Video/pointAI.mp4");
      setIsVideoPlaying(true);
      setIsBotTurn(false);
    }
  };

  const handleShoot = () => {
    if (gameResult !== "") {
      setGameResult("");
    }
    if (!isBotTurn) {
      handlePlayerTurn();
    }
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    if (pendingResult === "win") {
      setGameResult("You Win +0.0088 ETH 🏆");
    } else if (pendingResult === "lose") {
      setGameResult("You Died ☠️");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    setPendingResult(null);
  };

  return (
    <div className="flex justify-center items-center p-5 mt-20">
      <div className="container flex justify-center h-screen">
        <div className="info bg-white w-1/5 h-fit mr-5 rounded-2xl text-zinc-950 p-5">
          <p className="text-center mb-3 font-bold text-xl">Details</p>
          <div className="flex justify-center items-center flex-col text-center">
            <div className="mb-3">
              <div className="mb-3 font-bold bg-red-950 text-white p-2 rounded-lg">
                Game prize pool: 1.232 ETH
              </div>
              <p className="font-bold">Deposit</p>
              <div className="flex mt-1">
                <input
                  type="text"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  placeholder="Amount"
                  className="input w-full max-w-xs mr-2 bg-zinc-950 text-white text-center"
                />
                <button
                  className="w-fit btn btn-info bg-red-900 hover:bg-red-950 border-none text-white"
                  onClick={handleDeposit}
                >
                  Deposit 📥
                </button>
              </div>
              <p className="mt-5 font-bold">Withdraw</p>
              <div className="flex mt-1">
                <input
                  type="text"
                  value={inputWithdraw}
                  onChange={(e) => setInputWithdraw(e.target.value)}
                  placeholder="Amount"
                  className="input w-full max-w-xs mb-5 mr-2 bg-zinc-950 text-white text-center"
                />
                <button
                  className="btn btn-info bg-success hover:bg-green-950 border-none text-white"
                  onClick={handleWithdraw}
                >
                  Withdraw 📤
                </button>
              </div>
              <p className="mt-5 font-bold bg-zinc-950 text-white py-2 rounded-lg">
                Your balance 💰 {balance === 0 || !balance ? "0.00" : balance}{" "}
                ETH
              </p>
            </div>
          </div>
        </div>

        {/* Game Section */}
        <div className="Gamebox bg-white w-fit h-fit rounded-2xl flex justify-center items-center flex-col">
          <p className="text-black font-bold mt-7 text-xl p-5">
            🔫 Crimson Chamber
          </p>
          {videoSrc && (
            <video
              ref={videoRef}
              key={videoSrc}
              width="800"
              autoPlay
              muted
              className="p-5 rounded-xl"
              onEnded={handleVideoEnd}
              poster="thumbnail2.png"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
          <button className="btn btn-success text-white">Play 🎮</button>
          {gameResult && (
            <p className="mb-4 text-xl font-bold text-center text-red-900">
              {gameResult}
            </p>
          )}
          {!isVideoPlaying && !isBotTurn && (
            <button
              className="btn mb-5 btn-info bg-red-900 hover:bg-red-950 border-none text-white"
              onClick={handleShoot}
              disabled={gameResult !== ""}
            >
              Shoot 💥
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamebox;
