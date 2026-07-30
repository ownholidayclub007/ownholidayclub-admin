import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonPath,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-[#C8102E] uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-2 text-lg">{description}</p>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center gap-3">
          {buttonText && buttonPath && (
            <button
              onClick={() => navigate(buttonPath)}
              className="flex items-center gap-2 bg-[#C8102E] text-white px-6 py-3 rounded-sm hover:bg-[#a00d24] transition uppercase tracking-wider text-sm font-bold shadow-lg"
            >
              {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
              {buttonText}
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
