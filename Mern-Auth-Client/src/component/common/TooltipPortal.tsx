import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface TooltipPortalProps {
    children: React.ReactNode;
    targetRect: DOMRect | null;
    visible: boolean;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, targetRect, visible }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (targetRect && visible) {
            setStyle({
                position: "fixed",
                left: targetRect.left + targetRect.width / 2,
                top: targetRect.top - 8, // 8px above
                transform: "translate(-50%, -100%)",
                zIndex: 9999,
                pointerEvents: "none",
            });
        }
    }, [targetRect, visible]);

    if (!visible || !targetRect) return null;
    return ReactDOM.createPortal(
        <div style={style}>{children}</div>,
        document.body
    );
};

export default TooltipPortal;
