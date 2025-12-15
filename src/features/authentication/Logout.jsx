// src/features/authentication/Logout.jsx
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import useLogout from "../../hooks/useLogout";
import LogoutConfirmationModal from "../../components/ui/LogoutConfirmationModal";
import Loading from "../../ui/Loading";

function Logout() {
  const { 
    isPending, 
    handleLogoutWithConfirmation,
    confirmLogout,
    cancelLogout,
    showConfirmModal 
  } = useLogout();

  return (
    <>
      <button
        onClick={handleLogoutWithConfirmation}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        title="خروج از سیستم"
        disabled={isPending}
      >
        {isPending ? (
          <div className="w-5 h-5 flex items-center justify-center">
            <Loading size="sm" />
          </div>
        ) : (
          <HiArrowRightOnRectangle className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-200" />
        )}
      </button>

      {/* مدال تاییدیه خروج */}
      <LogoutConfirmationModal
        isOpen={showConfirmModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        isPending={isPending}
      />
    </>
  );
}

export default Logout;