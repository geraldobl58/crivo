import { ButtonTop } from "../ButtonTop";
import { FooterLinks } from "../FooterLinks";

export const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/6 py-20 mt-16">
      <div className="w-full max-w-7xl mx-auto px-4">
        <FooterLinks />
      </div>
      <ButtonTop />
    </footer>
  );
};
