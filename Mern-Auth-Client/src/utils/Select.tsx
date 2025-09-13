import { useState, useRef, useEffect } from "react";
import { cn } from "./cn";
import { ChevronDown, Check } from "lucide-react";

interface Props {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  items: { value: string; text: string; disabled?: boolean }[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  openClass?: string;
}

const Select = ({
  name,
  label,
  required,
  error,
  className,
  items,
  openClass,
  value = [],
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    let newValue: string[];
    if (value.includes(val)) {
      newValue = []; // Unselect if already selected
    } else {
      newValue = [val]; // Only one selected at a time
    }
    if (onChange) {
      onChange(newValue);
    }
    setOpen(false);
  };

  return (
    <div className={`relative`} ref={ref}>
      {label && (
        <label className="text-blue-200 mb-2 block text-xs font-medium sm:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={cn(
          `flex cursor-pointer items-center rounded-lg border px-4 py-2 sm:px-5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 bg-bgLight dark:bg-darkBorder border-btnGrFromLight dark:border-darkBorder text-gray-900 dark:text-blue-200`,
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <span
          className={`flex-1 ${value.length === 0 ? 'text-blue-400' : 'text-gray-900 dark:text-blue-100'}`}
        >
          {value.length
            ? items.filter((i) => value.includes(i.value)).map((i) => i.text)
            : `Select ${name}`}
        </span>
        <ChevronDown
          className={`dark:text-blue-400 h-4 w-4 sm:h-5 sm:w-5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className={cn(
          'absolute z-50 mt-2 sm:w-full rounded-lg border p-2 shadow-xl',
          'bg-white dark:bg-darkBorder border-btnGrFromLight dark:border-darkBorder text-gray-900 dark:text-blue-100',
          openClass
        )}>
          {items.map((item) => {
            const checked = value.includes(item.value);
            return (
              <label
                key={item.value}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 sm:gap-4 transition-colors duration-300',
                  'hover:bg-btnGrFromLight dark:hover:bg-[#10131a]'
                )}
              >
                {/* Custom Checkbox */}
                <span className="relative flex h-5 w-5 cursor-pointer items-center justify-center sm:h-6 sm:w-6">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSelect(item.value)}
                    className="absolute h-4 w-4 cursor-pointer bg-transparent opacity-0 sm:h-5 sm:w-5"
                  />
                  <span
                    className={`border-blue-400 flex h-4 w-4 items-center justify-center rounded-[2px] border transition-colors duration-150 sm:h-[17px] sm:w-[17px] ${checked ? '!border-primary bg-primary' : 'bg-transparent'}`}
                  >
                    {checked && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </span>
                </span>
                <span className={cn('text-xs sm:text-base', 'text-gray-900 dark:text-blue-100')}>
                  {item.text}
                </span>
              </label>
            );
          })}
        </div>
      )}
      {error && (
        <span className="inline-block px-5 text-sm text-red-500 sm:text-base">
          {error && (
            <>
              <span>{error}</span>
            </>
          )}
          &nbsp;
        </span>
      )}
    </div>
  );
};

export default Select;
