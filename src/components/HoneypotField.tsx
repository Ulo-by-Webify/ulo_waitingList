import { forwardRef } from "react";
import { HONEYPOT_FIELD } from "@/lib/validation";

/**
 * Off-screen input that people never see, focus or fill in (hidden from screen readers and
 * tab order). Spam bots that fill every field reveal themselves; the server drops those posts.
 */
const HoneypotField = forwardRef<HTMLInputElement>(function HoneypotField(_props, ref) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input ref={ref} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
});

export default HoneypotField;
