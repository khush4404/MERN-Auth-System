import React, { useRef, useState, useEffect } from "react";
import TooltipPortal from "./TooltipPortal";

interface Props {
    description: string;
}

const ActionDescriptionCell: React.FC<Props> = ({ description }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (showTooltip && spanRef.current) {
            setRect(spanRef.current.getBoundingClientRect());
        }
    }, [showTooltip]);

    return (
        <div className="relative w-full">
            <span
                ref={spanRef}
                className="overflow-x-hidden text-ellipsis block max-w-full whitespace-nowrap cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {description}
            </span>
            <TooltipPortal targetRect={rect} visible={showTooltip}>
                <span className="bg-black text-white text-xs rounded px-2 py-1 max-w-xs whitespace-normal break-words shadow-lg min-w-[150px] text-center block">
                    {description}
                </span>
            </TooltipPortal>
        </div>
    );
};

export default ActionDescriptionCell;
