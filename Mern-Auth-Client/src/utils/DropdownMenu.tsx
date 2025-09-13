// src/component/common/DropdownMenu.tsx
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "./cn";

interface DropdownMenuProps {
    trigger: React.ReactNode;
    items: {
        label: string;
        onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
        disabled?: boolean;
    }[];
    align?: "start" | "center" | "end";
}

const DropdownMenu = ({ trigger, items, align = "end" }: DropdownMenuProps) => {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content
                    align={align}
                    className={cn(
                        "z-50 min-w-[150px] rounded-xl p-2 shadow-xl border mt-2",
                        "bg-white dark:bg-darkBorder border-btnGrFromLight dark:border-primary text-gray-900 dark:text-blue-100"
                    )}
                >
                    {items.map((item, idx) => (
                        <Dropdown.Item
                            key={idx}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={cn(
                                "px-4 py-2 text-base cursor-pointer rounded-lg transition-colors duration-300",
                                "text-gray-900 dark:text-blue-100 hover:bg-btnGrFromLight dark:hover:bg-primary hover:text-primaryBg",
                                item.disabled && "opacity-50 pointer-events-none"
                            )}
                        >
                            {item.label}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown.Root>
    );
};

export default DropdownMenu;
