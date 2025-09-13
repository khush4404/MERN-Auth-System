import React, { useRef, useState, useEffect } from "react";
import TooltipPortal from "./TooltipPortal";

interface Props {
  value: string; // expects ISO string or Date string
  className?: string;
  type?: "date" | "default"; // optional, for future extensibility
}

const TooltipCell: React.FC<Props> = ({ value, className, type }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (showTooltip && spanRef.current) {
      setRect(spanRef.current.getBoundingClientRect());
    }
  }, [showTooltip]);

  // If type is 'date' or value looks like a date, show only date, tooltip full
  let displayValue = value;
  let tooltipValue = value;
  let isDateType = false;
  if (type === "date" || !isNaN(Date.parse(value))) {
    isDateType = true;
    const dateObj = new Date(value);
    displayValue = dateObj.toLocaleDateString();
    tooltipValue = dateObj.toLocaleString();
  }

  return (
    <div className={`relative w-full ${className || ""}`}>
      <span
        ref={spanRef}
        className="overflow-x-hidden text-ellipsis block max-w-full whitespace-nowrap cursor-pointer dark:text-blue-100 text-black/50 dark:group-hover:text-primary group-hover:text-gray-700 transition-colors duration-300"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isDateType ? displayValue : value}
      </span>
      {isDateType && (
        <TooltipPortal targetRect={rect} visible={showTooltip}>
          <span className="dark:bg-darkBorder bg-btnGrToLight text-gray-800 dark:text-blue-100 text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal break-words shadow-2xl min-w-[150px] text-center block border dark:border-primary border-textGrayMedium">
            {tooltipValue}
          </span>
        </TooltipPortal>
      )}
      {!isDateType && (
        <TooltipPortal targetRect={rect} visible={showTooltip}>
          <span className="dark:bg-darkBorder bg-btnGrToLight text-gray-800 dark:text-blue-100 text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal break-words shadow-2xl min-w-[150px] text-center block border dark:border-primary border-textGrayMedium">
            {value}
          </span>
        </TooltipPortal>
      )}
    </div>
  );
};

export default TooltipCell;
