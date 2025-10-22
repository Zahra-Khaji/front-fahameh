import UserAvatar from "../features/authentication/UserAvatar";
import useUser from "../features/authentication/useUser";
import HeaderMenu from "./HeaderMenu";
import { HiMenu } from "react-icons/hi";



function Header({ onToggleSidebar }) {
  const { isLoading } = false;

  return (
    <div className="bg-secondary-0 py-4 px-4 lg:px-8 border-b border-secondary-200">
      <div className={`flex items-center justify-between lg:justify-end gap-x-8 ${
        isLoading ? "blur-sm opacity-50" : ""
      }`}>
        {/* Hamburger menu for mobile */}
        <button 
          className="lg:hidden p-2 rounded-md hover:bg-secondary-100 transition-colors"
          onClick={onToggleSidebar}
        >
          <HiMenu className="w-6 h-6 text-secondary-600" />
        </button>
        
        <div className="flex items-center gap-x-4 lg:gap-x-8">
          <UserAvatar />
          <HeaderMenu />
        </div>
      </div>
    </div>
  );
}

export default Header;

// export default Header;