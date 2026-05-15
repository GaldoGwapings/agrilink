import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { Link } from "react-router-dom";
import { Phone, MapPin, Mail, Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5EAD7] pt-16 pb-8">
      <div className="container mx-auto px-4">

        {/* Center: AgriLink brand + Contact Us side by side */}
        <div className="grid grid-cols-2 gap-16 max-w-3xl mx-auto mb-16">

          {/* AgriLink brand */}
          <div className="space-y-6 max-w-xs">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4D7C0F] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#4D7C0F]/20">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#1A2E05]">AgriLink</span>
            </Link>
            <p className="text-[#5B6D44] text-sm leading-relaxed">
              Empowering Filipino farmers through AI-driven harvest prediction and direct market connection. Reducing waste, increasing income.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-6">
            <h4 className="font-bold text-[#1A2E05]">Contact Us</h4>
            <ul className="space-y-4 text-sm text-[#5B6D44]">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#4D7C0F]" />
                hello@agrilink.ph
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#4D7C0F]" />
                +639609013981
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#4D7C0F]" />
                Claro M. Recto Avenue, Lapasan, Cagayan de Oro City
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar — copyright centered */}
        <div className="pt-8 border-t border-[#F1F4E8] flex flex-col items-center gap-4 text-xs text-[#5B6D44] font-medium">
          <p>© 2026 AgriLink Philippines. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#4D7C0F]">Privacy Policy</a>
            <a href="#" className="hover:text-[#4D7C0F]">Terms of Service</a>
            <a href="#" className="hover:text-[#4D7C0F]">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}