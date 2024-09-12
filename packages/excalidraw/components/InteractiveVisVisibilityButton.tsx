import React, {useEffect} from 'react';
import "./InteractiveVisVisibilityButton.scss"; // 确保路径正确
import socket from '../sockioExport';

type InteractiveVisVisibilityButtonProps = {
  title?: string;
  checked: boolean;
  onChange?: (isVisible: boolean) => void;
//   isMobile?: boolean;
};

export const InteractiveVisVisibilityButton = ({
  title,
  checked,
  onChange,
//   isMobile = false,
}: InteractiveVisVisibilityButtonProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // 调用onChange并传递checkbox的checked状态
        onChange?.(event.target.checked);
      };
    useEffect(() => {
        socket.emit("chanegInterativeVisibility", checked);
        return () => {
    };
    }, [checked]);
  return (
    // <div className={`InteractiveVisVisibilityButton-wrapper ${isMobile ? 'is-mobile' : ''}`}>
    <div className={`InteractiveVisVisibilityButton-wrapper`}>
      <label
        className="InteractiveVisVisibilityButton"
        title={title}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          aria-label={title}
        />
        <span className="slider"></span>
      </label>
      {/* <span className="interactive-demo-text">Interactive Demo Mode</span> */}
      <span className="interactive-demo-text">
        {`Interactive Demo: ${checked ? 'On' : 'Off'}`}
      </span>
    </div>
  );
};
