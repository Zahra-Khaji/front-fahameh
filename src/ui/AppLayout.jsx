import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  return (
    <div 
    // className="grid h-screen grid-cols-[15rem_1fr] grid-rows-[auto_1fr]"
    className="h-screen flex flex-col lg:grid lg:grid-cols-[15rem_1fr] lg:grid-rows-[auto_1fr]"
    >
      {/* Header - spans both columns */}
      <header className="col-span-2">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </header>
      
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside className="hidden lg:block bg-secondary-0 border-l border-secondary-200">
        <Sidebar>
          {children}
        </Sidebar>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        lg:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)}>
          {children}
        </Sidebar>
      </div>

      {/* Main Content */}
      <main
    
      className="flex-1 bg-secondary-100 p-2.5 lg:p-5 overflow-y-auto"
      // className="flex-1 bg p-4 lg:p-8 overflow-y-auto"

       
       >
        <div className="mx-auto max-w-screen-lg flex flex-col gap-y-8 lg:gap-y-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;