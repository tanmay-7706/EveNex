import { Instagram, Twitter, Linkedin } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 text-sm text-gray-400">
        Made with ShadcnUI and Mobbin 
      </div>

      <div className="flex gap-4 items-center">
        <a
          href="https://www.linkedin.com/in/tanmaysingh7706"
          className="text-gray-400"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href="https://www.instagram.com/_tanmay_7.7"
          className="text-gray-400"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://x.com/tanmay_7706" className="text-gray-400">
          <Twitter className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;