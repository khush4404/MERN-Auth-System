import Icon from "./Icon";

export const ToastIcons = {
	info: () => <Icon icon="info" className="text-indigo-400" />,
	error: () => <Icon icon="circle-alert" className="text-[#E7433C]" />,
	success: () => <Icon icon="circle-check" className="text-[#70BC0C]" />,
	warning: () => <Icon icon="triangle-alert" className="text-yellow-500" />,
};
