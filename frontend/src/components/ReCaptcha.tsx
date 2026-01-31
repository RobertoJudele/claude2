// src/components/ReCaptcha.tsx
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface Props {
  onChange: (token: string | null) => void;
}

const ReCaptcha: React.FC<Props> = ({ onChange }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string; // Vite style
  return <ReCAPTCHA sitekey={siteKey} onChange={onChange} />;
};

export default ReCaptcha;
