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
  const [prizePool, setPrizePool] = useState(0); // State for prize pool
  const [inputDeposit, setInputDeposit] = useState("");
  const [inputWithdraw, setInputWithdraw] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(""); // Added for error handling
 
  const [bulletPositions, setBulletPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const contractAddress = "Your Contact"; // Replace with your contract address
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
    if (account && contract) {
      loadPrizePool(); // Fetch the prize pool when account or contract is available
    }
  }, [account, balance, contract]);
 
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
          const _contract = new _web3.eth.Contract(
            [
              //Don't Forget to paste your ABI
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
 
  // const handlePlay = async () => {
  //   try {
  //     setLoading(true);
 
  //     // เชื่อมต่อกับ Ethereum
  //     await window.ethereum.request({ method: "eth_requestAccounts" });
 
  //     const accounts = await web3.eth.getAccounts();
 
  //     // เรียกใช้ฟังก์ชัน getBulletPositions() จาก Solidity
  //     const result = await contract.methods
  //       .getBulletPositions()
  //       .send({ from: accounts[0] }); // ใช้ .send() เพื่อให้จ่าย gas เอง
 
  //     // ตรวจสอบว่ามีข้อมูล BulletPosition หรือไม่
  //     if (result.events && result.events.BulletPosition) {
  //       const bulletPositions =
  //         result.events.BulletPosition.returnValues.positions;
  //       setBulletPositions(bulletPositions); // อัพเดตตำแหน่งลูกกระสุนใน state
  //       console.log(bulletPositions);

  //     await loadBalance(contract);
  //     setInputDeposit("");

  //       // หาตำแหน่งที่เป็น 1n (ยิง)
  //       const stopAtIndex = bulletPositions.findIndex((value) => value === 1n); // หาตำแหน่งที่มีค่าเป็น 1
 
  //       // สร้าง array ของวิดีโอที่เล่นจนถึงตำแหน่งที่มีค่าเป็น 1n
  //       const videoArray = bulletPositions
  //         .map((value, index) => {
  //           // ถ้าเจอค่าที่เป็น 1 หรือมากกว่า (ตามที่ต้องการหยุด)
  //           if (stopAtIndex !== -1 && index > stopAtIndex) {
  //             return null; // ไม่เล่นวิดีโอหลังจากเจอค่า 1
  //           }
 
  //           const position = value; // ใช้ BigInt โดยตรง
 
  //           if (index % 2 === 0) {
  //             // index เป็นเลขคู่
  //             return position === 0n
  //               ? "/Video/notshootPLAYER.mp4"
  //               : "/Video/shootPLAYER.mp4";
  //           } else {
  //             // index เป็นเลขคี่
  //             return position === 0n
  //               ? "/Video/notshootAI.mp4"
  //               : "/Video/shootAI.mp4";
  //           }
  //         })
  //         .filter((video) => video !== null); // กรองค่าที่เป็น null ออกไป
 
  //       console.log(videoArray); // แสดงผล videoArray ที่เลือก
 
  //       // เล่นคลิปแรกทันที
  //       setVideoSrc(videoArray[0]);
 
  //       // เล่นวิดีโอทีละตัวหลังจากคลิปแรก
  //       let currentIndex = 1; // เริ่มที่คลิปที่สอง
  //       const interval = setInterval(() => {
  //         if (currentIndex < videoArray.length) {
  //           setVideoSrc(videoArray[currentIndex]);
  //           currentIndex++;
  //         } else {
  //           clearInterval(interval); // หยุดเมื่อเล่นจนถึงคลิปสุดท้าย
            
  //         }
  //       }, 12000); // ดีเลย์สำหรับการเล่นคลิปถัดไป (12000ms = 12 วินาที)
  //     }
  //   } catch (error) {
  //     console.error("Error calling contract method:", error);
  //     Swal.fire({
  //       title: "Error!",
  //       text: "Failed to get bullet positions from contract.",
  //       icon: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePlay = async () => {
    try {
      setLoading(true);
  
      // เชื่อมต่อกับ Ethereum
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const accounts = await web3.eth.getAccounts();
  
      // เรียกใช้ฟังก์ชัน getBulletPositions() จาก Solidity
      const result = await contract.methods
        .getBulletPositions()
        .send({ from: accounts[0] }); // ใช้ .send() เพื่อให้จ่าย gas เอง
  
      // ตรวจสอบว่ามีข้อมูล BulletPosition หรือไม่
      if (result.events && result.events.BulletPosition) {
        const bulletPositions =
          result.events.BulletPosition.returnValues.positions;
        setBulletPositions(bulletPositions); // อัพเดตตำแหน่งลูกกระสุนใน state
        console.log(bulletPositions);
  
        await loadBalance(contract);
        setInputDeposit("");
  
        // หาตำแหน่งที่เป็น 1n (ยิง)
        const stopAtIndex = bulletPositions.findIndex((value) => value === 1n); // หาตำแหน่งที่มีค่าเป็น 1
  
        // สร้าง array ของวิดีโอที่เล่นจนถึงตำแหน่งที่มีค่าเป็น 1n
        const videoArray = bulletPositions
          .map((value, index) => {
            // ถ้าเจอค่าที่เป็น 1 หรือมากกว่า (ตามที่ต้องการหยุด)
            if (stopAtIndex !== -1 && index > stopAtIndex) {
              return null; // ไม่เล่นวิดีโอหลังจากเจอค่า 1
            }
  
            const position = value; // ใช้ BigInt โดยตรง
  
            if (index % 2 === 0) {
              // index เป็นเลขคู่
              return position === 0n
                ? "/Video/notshootPLAYER.mp4"
                : "/Video/shootPLAYER.mp4";
            } else {
              // index เป็นเลขคี่
              return position === 0n
                ? "/Video/notshootAI.mp4"
                : "/Video/shootAI.mp4";
            }
          })
          .filter((video) => video !== null); // กรองค่าที่เป็น null ออกไป
  
        console.log(videoArray); // แสดงผล videoArray ที่เลือก
  
        // เล่นคลิปแรกทันที
        setVideoSrc(videoArray[0]);
  
        // เล่นวิดีโอทีละตัวหลังจากคลิปแรก
        let currentIndex = 1; // เริ่มที่คลิปที่สอง
        const interval = setInterval(() => {
          if (currentIndex < videoArray.length) {
            setVideoSrc(videoArray[currentIndex]);
            currentIndex++;
          } else {
            clearInterval(interval); // หยุดเมื่อเล่นจนถึงคลิปสุดท้าย
  
            // เมื่อถึงวิดีโอสุดท้าย
            if (videoArray[videoArray.length - 1] === "/Video/shootAI.mp4") {
              // รอให้วิดีโอสุดท้ายเล่นจบก่อนทำเงื่อนไข
              setTimeout(async () => {
                try {
                  const rewardAmount = web3.utils.toWei("0.002", "ether"); // แปลงจำนวนเงินเป็น Wei
                  await contract.methods
                    .distributeReward(accounts[0], rewardAmount) // เรียกฟังก์ชัน distributeReward
                    .send({ from: accounts[0] }); // ส่งคำสั่งจากบัญชีของผู้เล่น
  
                  Swal.fire({
                    title: "Congratulations!",
                    text: "You have received a reward of 0.002 ETH!",
                    icon: "success",
                  });
  
                  await loadBalance(contract); // อัพเดตยอดเงินในแอป
                } catch (rewardError) {
                  console.error("Error distributing reward:", rewardError);
                  Swal.fire({
                    title: "Error!",
                    text: "Failed to distribute reward.",
                    icon: "error",
                  });
                }
              }, 12000); // ตั้งเวลาหน่วง 12 วินาทีหลังวิดีโอสุดท้าย
            }
          }
        }, 12000); // ดีเลย์สำหรับการเล่นคลิปถัดไป (12000ms = 12 วินาที)
      }
    } catch (error) {
      console.error("Error calling contract method:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to get bullet positions from contract.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  
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

  const loadPrizePool = async () => {
    if (contract && account) {
      try {
        const poolBalance = await contract.methods.checkPool().call({ from: account });
        const ethPoolBalance = web3.utils.fromWei(poolBalance, "ether");
        setPrizePool(ethPoolBalance); // Update prize pool state
      } catch (error) {
        console.error("Error fetching prize pool:", error);
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
 
  return (
    <div className="flex justify-center items-center p-5 mt-20">
      <div className="container flex justify-center h-screen">
        <div className="info bg-white w-1/5 h-fit mr-5 rounded-2xl text-zinc-950 p-5">
          <p className="text-center mb-3 font-bold text-xl">Details</p>
          <div className="flex justify-center items-center flex-col text-center">
            <div className="mb-3">
              <div className="mb-3 font-bold bg-red-950 text-white p-2 rounded-lg">
              Game prize pool: {prizePool === 0 || !prizePool ? "0.00" : prizePool}{" "} ETH 
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
          {bulletPositions.length > 0 && (
            <p className="text-black font-bold mt-3">
              {/* Bullet positions: {bulletPositions.join(", ")} */}
            </p>
          )}
 
          {videoSrc && (
            <video
              ref={videoRef}
              key={videoSrc}
              width="800"
              autoPlay
              muted
              className="p-5 rounded-xl"
              poster="thumbnail2.png"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
          <button
            className="btn btn-success text-white mb-5"
            onClick={handlePlay}
          >
            Play (-0.001) 🎮
          </button>
 
          {gameResult && (
            <p className="mb-4 text-xl font-bold text-center text-red-900">
              {gameResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default Gamebox;
 