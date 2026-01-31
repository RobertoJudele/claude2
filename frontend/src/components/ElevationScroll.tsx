import React from "react";
import useScrollTrigger from "@mui/material/useScrollTrigger";

interface ElevationScrollProps {
  children: React.ReactElement<any>;
}

const ElevationScroll: React.FC<ElevationScrollProps> = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0, // how far to scroll before triggering
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0, // 4 = shadow, 0 = no shadow
  });
};

export default ElevationScroll;
