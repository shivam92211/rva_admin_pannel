import { SetterOrUpdater } from "recoil";

export const copyToClipboard = async (
  text: string,
) => {
  try {
    await navigator?.clipboard?.writeText(text);
    alert("Hello");
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};


export const handleCopy = async (value: string, setMsg: SetterOrUpdater<{
  msg: string;
  type?: "info" | "error" | "warn" | "success";
} | null>) => {
  try {
    // Always fallback to a text area method if clipboard API unavailable
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setMsg({ msg: "Copied to clipboard", type: "success" });
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    setMsg({ msg: "Failed to copy text", type: "error" });
  }
};
