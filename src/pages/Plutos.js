import React, { useState, useEffect, useRef, useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import styled, { keyframes } from "styled-components";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Animate from "../Components/Animate";
import Spinner from "../Components/Spinner";
import { useUser } from "../context/userContext";
import Levels from "../Components/Levels";
import flash from "../images/flash.webp";
import coinsmall from "../images/main-logo.png";
import useSound from "use-sound";
import boopSfx from "../get.mp3";
import burnSfx from "../burn.wav";
import { NavLink } from "react-router-dom";
import leaderboard from "../images/leaderboard.png";
import EnergyBar from "../Components/energybar";

const slideUp = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-350px);
  }
`;

const SlideUpText = styled.div`
  position: absolute;
  animation: ${slideUp} 3s ease-out;
  font-size: 2.1em;
  color: #ffffffa6;
  font-weight: 600;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  pointer-events: none; /* To prevent any interaction */
`;

const Container = styled.div`
  position: relative;
  display: inline-block;
  text-align: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Plutos = () => {
  const imageRef = useRef(null);
  const [play] = useSound(boopSfx);
  const [play2] = useSound(burnSfx);
  const [clicks, setClicks] = useState([]);
  const {
    name,
    smallname,
    balance,
    tapBalance,
    energy,
    battery,
    tapGuru,
    mainTap,
    setIsRefilling,
    refillIntervalRef,
    refillEnergy,
    setEnergy,
    tapValue,
    setTapBalance,
    setBalance,
    refBonus,
    level,
    newEnergy,
    loading,
  } = useUser();

  // eslint-disable-next-line
  const [points, setPoints] = useState(0);
  // eslint-disable-next-line
  const [isDisabled, setIsDisabled] = useState(false);
  // eslint-disable-next-line
  const [openClaim, setOpenClaim] = useState(false);
  // eslint-disable-next-line
  const [congrats, setCongrats] = useState(false);
  // eslint-disable-next-line
  const [glowBooster, setGlowBooster] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  // eslint-disable-next-line
  const refillTimerRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const accumulatedBalanceRef = useRef(balance);
  const accumulatedEnergyRef = useRef(energy);
  const accumulatedTapBalanceRef = useRef(tapBalance);
  const refillTimeoutRef = useRef(null); // Add this line


  function triggerHapticFeedback() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    } else if (isAndroid && 'vibrate' in navigator) {
      // Use the vibration API on Android
      navigator.vibrate(50); // Vibrate for 50ms
    } else {
      console.warn('Haptic feedback not supported on this device.');
    }
  }

  const handleClick = (e) => {
    // Play the sound
    if (tapValue.value > 0) {
      // play();
    }
    triggerHapticFeedback();

    if (energy <= 0 || isDisabled || isUpdatingRef.current) {
      setGlowBooster(true); // Trigger glow effect if energy and points are 0
      setTimeout(() => {
        setGlowBooster(false); // Remove glow effect after 1 second
      }, 300);
      return; // Exit if no energy left or if clicks are disabled or if an update is in progress
    }

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? "wobble-left"
        : offsetX > horizontalMidpoint
          ? "wobble-right"
          : offsetY < verticalMidpoint
            ? "wobble-top"
            : "wobble-bottom";

    // Remove previous animations
    imageRef.current.classList.remove(
      "wobble-top",
      "wobble-bottom",
      "wobble-left",
      "wobble-right",
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);

    // Update state immediately for UI
    setEnergy((prevEnergy) => {
     // const newEnergy = Math.max(prevEnergy - tapValue.value, 0); // Ensure energy does not drop below zero
      accumulatedEnergyRef.current = newEnergy;
      return newEnergy;
    });

    setPoints((prevPoints) => prevPoints + tapValue.value);

    setBalance((prevBalance) => {
      const newBalance = prevBalance + tapValue.value;
      accumulatedBalanceRef.current = newBalance;
      return newBalance;
    });

    setTapBalance((prevTapBalance) => {
      const newTapBalance = prevTapBalance + tapValue.value;
      accumulatedTapBalanceRef.current = newTapBalance;
      return newTapBalance;
    });

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id),
      );
    }, 1000); // Match this duration with the animation duration

    // Reset the refill timer
    clearInterval(refillIntervalRef.current); // Stop refilling while the user is active
    setIsRefilling(false); // Set refilling state to false
    clearTimeout(refillTimeoutRef.current);
    refillTimeoutRef.current = setTimeout(() => {
      if (energy < battery.energy) {
        refillEnergy();
      }
    }, 1000); // Set the inactivity period to 3 seconds (adjust as needed)
  };
  const handleClickGuru = (e) => {
    if (tapValue.value > 0) {
      play2();
    }
    triggerHapticFeedback();

    if (energy <= 0 || isDisabled || isUpdatingRef.current) {
      setGlowBooster(true); // Trigger glow effect if energy and points are 0
      setTimeout(() => {
        setGlowBooster(false); // Remove glow effect after 1 second
      }, 300);
      return; // Exit if no energy left or if clicks are disabled or if an update is in progress
    }

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? "wobble-left"
        : offsetX > horizontalMidpoint
          ? "wobble-right"
          : offsetY < verticalMidpoint
            ? "wobble-top"
            : "wobble-bottom";

    // Remove previous animations
    imageRef.current.classList.remove(
      "wobble-top",
      "wobble-bottom",
      "wobble-left",
      "wobble-right",
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);

    // Update state immediately for UI
    setEnergy((prevEnergy) => {
     // const newEnergy = Math.max(prevEnergy - 0, 0); // Ensure energy does not drop below zero
      accumulatedEnergyRef.current = newEnergy;
      return newEnergy;
    });

    setPoints((prevPoints) => prevPoints + tapValue.value * 5);

    setBalance((prevBalance) => {
      const newBalance = prevBalance + tapValue.value * 5;
      accumulatedBalanceRef.current = newBalance;
      return newBalance;
    });

    setTapBalance((prevTapBalance) => {
      const newTapBalance = prevTapBalance + tapValue.value * 5;
      accumulatedTapBalanceRef.current = newTapBalance;
      return newTapBalance;
    });

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id),
      );
    }, 1000); // Match this duration with the animation duration

    // Reset the refill timer
    clearInterval(refillIntervalRef.current); // Stop refilling while the user is active
    setIsRefilling(false); // Set refilling state to false
    clearTimeout(refillTimeoutRef.current);
    refillTimeoutRef.current = setTimeout(() => {
      if (energy < battery.energy) {
        refillEnergy();
      }
    }, 1000); // Set the inactivity period to 3 seconds (adjust as needed)
  };

  const updateFirestore = async () => {
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (telegramUser) {
      const { id: userId } = telegramUser;
      const userRef = doc(db, "telegramUsers", userId.toString());

      // Set updating flag
      isUpdatingRef.current = true;

      try {
        await updateDoc(userRef, {
          balance: accumulatedBalanceRef.current,
          energy: accumulatedEnergyRef.current,
          tapBalance: accumulatedTapBalanceRef.current,
        });

        // No need to update state here as it is already updated immediately in handleClick

        // Reset accumulated values to current state values
        accumulatedBalanceRef.current = balance;
        accumulatedEnergyRef.current = energy;
        accumulatedTapBalanceRef.current = tapBalance;
      } catch (error) {
        console.error("Error updating balance and energy:", error);
      } finally {
        // Clear updating flag
        isUpdatingRef.current = false;
      }
    }
  };

  const energyPercentage = (energy / battery.energy) * 100;

  // const handleClaim = async () => {
  //   const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
  //   if (telegramUser) {
  //     const { id: userId } = telegramUser;
  //     const userRef = doc(db, 'telegramUsers', userId.toString());
  //     try {
  //       await updateDoc(userRef, {
  //         balance: balance + points,
  //         energy: energy,
  //         tapBalance: tapBalance + points

  //       });
  //       setBalance((prevBalance) => prevBalance + points);
  //       setTapBalance((prevTapBalance) => prevTapBalance + points);
  //       localStorage.setItem('energy', energy);

  //       if (energy <= 0) {
  //         setIsTimerVisible(true);
  //       }
  //       console.log('Points claimed successfully');
  //     } catch (error) {
  //       console.error('Error updating balance and energy:', error);
  //     }
  //   }
  //   openClaimer();
  // };

  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    // } else {
    //   return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    } else {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    }
  };

 return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Animate>
          <div className="w-full flex justify-center flex-col overflow-hidden">
          <div className="flex flex-row justify-center items-center mb-1">
          <div className="bg-blue-500 text-[#fff] text-[15px] font-extrabold text-center p-2 mr-2 rounded-[10px]">
  Welcome<br />{smallname}
</div>
       <div className="bg-green-500 text-[#000000] text-[17px] font-extrabold text-center p-2 mr-2 rounded-[10px]">
        Collect Bonus 
<div className="bg-green-500 text-[#ffffff] text-[17px] font-extrabold text-center p-2 mr-2 rounded-[10px]"> 
        20,000 $TURBOS AI </div> 
       <div className="bg-green-500 text-[#000000] text-[17px] font-extrabold text-center p-2 mr-2 rounded-[10px]">
        coins on 1st Daily claim on Tasks page<br />
</div></div>
</div>
            <div className="flex space-x-[18px] justify-center items-center mt-0">
              <div className="w-[50px] h-[50px]">
                <img src={coinsmall} className="w-full" alt="coin" />
              </div>               
              <h1 className="text-[#fff] text-[40px] font-extrabold font-family-[poppins]">
                {formatNumber(balance+ refBonus)}
              </h1>
            </div>
            
            <div className="w-full ml-[0px] flex space-x-1 items-center justify-center mt-0">
              {/* <img
                src={level.imgUrl}
                className="w-[35px] relative"
                alt="bronze"
              /> */}
              {/* <h2
                onClick={() => setShowLevels(true)}
                className="text-[#171717] text-[22px] font-medium"
              >
                {level.name}
              </h2> */}
              <div className="text-[#171717] text-[20px] font-medium text-center">
              $TURBOS AI
              <br></br>
             hmm...Don't tap me, only collect coins from Tasks page.
             </div>
              {/* <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#171717] mt-[2px]" /> */}
            </div>
            
            <div className="w-full flex justify-center items-center relative mt-2">
              <div className="bg-[#0077cc] blur-[50px] absolute w-[200px] h-[220px] rounded-full mb-[70px]"></div>
              <div className={`${tapGuru ? "block" : "hidden"} pyro`}>
                <div className="before"></div>
                <div className="after"></div>
              </div>
              <div className="w-[300px] h-[310px] relative flex items-center justify-center">
                <img
                  src="/lihgt.gif"
                  alt="err"
                  className={`absolute w-[300px] rotate-45 mb-[100px] ${tapGuru ? "block" : "hidden"}`}
                />
                {/* <div className="image-container flex-grow flex justify-center items-center">
                  {mainTap && (
                    <Container>
                      <img
                        onPointerDown={handleClick}
                        ref={imageRef}
                        src={level.imgTap}
                        alt="Wobble"
                        className="wobble-image !w-[360px] select-none"
                      />
                      {clicks.map((click) => (
                        <SlideUpText key={click.id} x={click.x} y={click.y}>
                          +{tapValue.value}
                        </SlideUpText>
                      ))}
                    </Container>
                  )}
                  {tapGuru && (
                    <Container>
                      <img
                        onPointerDown={handleClickGuru}
                        ref={imageRef}
                        src={level.imgBoost}
                        alt="Wobble"
                        className="wobble-image !w-[360px] select-none"
                      />
                      {clicks.map((click) => (
                        <SlideUpText key={click.id} x={click.x} y={click.y}>
                          +{tapValue.value * 5}
                        </SlideUpText>
                      ))}
                    </Container>
                  )}
                </div> */}
                <img
                        
                        ref={imageRef}
                        src={level.imgBoost}
                        alt="Wobble"
                        className="wobble-image !w-[360px] select-none"
                      />
              </div>
            </div>
  
            <div className="flex flex-col space-y-6 fixed bottom-[120px] left-0 right-0 justify-center items-center px-5">
              <div className="flex flex-col w-full items-center justify-center">
                <div className="flex pb-[6px] space-x-1 items-center justify-center text-[#fff]">
                  <img alt="flash" src={flash} className="w-[20px]" />
                  {/* <div>
                    <span className="text-[18px] font-bold">{energy}</span>
                    <span className="text-[14px] font-medium">/ {battery.energy}</span>
                  </div> */}
                </div>
                {/* <div className="flex w-full p-[4px] h-[20px] items-center bg-energybar rounded-[12px] border-[1px] border-borders2">
                  <div
                    className="bg-[#9d0000] h-full rounded-full transition-width duration-100"
                    style={{ width: `${energyPercentage}%` }}
                  ></div>
                </div> */}
              </div>
            </div>
            {/* <EnergyBar 
              energy={energy}
              battery={battery}
              energyPercentage={energyPercentage}
              flash={flash}
              leaderboard={leaderboard}
            /> */}
            <Levels showLevels={showLevels} setShowLevels={setShowLevels} />
          </div>
        </Animate>
      )}
    </>
  );
};

export default Plutos;
