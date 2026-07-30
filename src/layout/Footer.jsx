const Footer = () => (
  <footer className="w-full border-t bg-white border-[#F5C6CC]">
    <div className="px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* COPYRIGHT */}
      <p className="text-sm md:text-base font-bold text-gray-700">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#C8102E] font-bold">Own Holiday Club</span>
        <span className="ml-1 text-gray-500">· All rights reserved</span>
      </p>

      {/* LINKS */}
      <div className="flex items-center space-x-6">
        <a
          href="#"
          className="text-sm md:text-base font-semibold text-gray-600 hover:text-[#C8102E] transition-colors duration-200"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          className="text-sm md:text-base font-semibold text-gray-600 hover:text-[#C8102E] transition-colors duration-200"
        >
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
