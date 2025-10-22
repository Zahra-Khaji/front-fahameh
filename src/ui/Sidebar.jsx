import { HiX } from "react-icons/hi";


function Sidebar({ children, onClose }) {
  return (
    <div className="bg-secondary-0 h-full w-full border-l border-secondary-200 p-4">
      {/* Close button only for mobile */}
      {onClose && (
        <button 
          className="lg:hidden absolute left-4 top-4 p-1 rounded-md hover:bg-secondary-100 transition-colors"
          onClick={onClose}
        >
          <HiX className="w-5 h-5 text-secondary-600" />
        </button>
      )}
      
      <ul className="flex flex-col gap-y-4 mt-8 lg:mt-0">
        {children}
      </ul>
    </div>
  );
}

export default Sidebar;