import type { InputHTMLAttributes } from "react";
import { formatTzLocalMask, toTzE164, tzLocalDigits } from "../lib/phone";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value: string;
  onChange: (e164: string) => void;
};

export function TzPhoneField({
  value,
  onChange,
  className,
  id,
  placeholder = "6XX XXX XXX",
  autoComplete = "tel",
  ...rest
}: Props) {
  const local = tzLocalDigits(value);
  const masked = formatTzLocalMask(local);

  return (
    <div className={`tz-phone ${className ?? ""}`.trim()}>
      <span className="tz-phone-cc" aria-hidden>
        +255
      </span>
      <input
        {...rest}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        maxLength={11}
        placeholder={placeholder}
        value={masked}
        aria-label={
          rest["aria-label"] ??
          (id
            ? undefined
            : "Tanzania mobile number, 9 digits starting with 6 or 7")
        }
        onChange={(e) => onChange(toTzE164(e.target.value))}
      />
    </div>
  );
}
