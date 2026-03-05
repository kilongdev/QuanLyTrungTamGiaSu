import React, { useEffect, useRef, useState } from "react";

const useScrollHandling = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const previousScrollPosiotion = useRef(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollTracking = () => {
    const currentScrollPosition = window.pageYOffset;
    if (currentScrollPosition > previousScrollPosiotion.current) {
      setScrollDirection("Down");
    } else if (currentScrollPosition < previousScrollPosiotion.current) {
      setScrollDirection("Up");
    }
    previousScrollPosiotion.current =
      currentScrollPosition <= 0 ? 0 : currentScrollPosition;
    setScrollPosition(currentScrollPosition);
  };
  useEffect(() => {
    window.addEventListener("scroll", scrollTracking);
    return () => {
      window.removeEventListener("scroll", scrollTracking);
    };
  }, []);
  return { scrollDirection, scrollPosition };
};

export default useScrollHandling;
