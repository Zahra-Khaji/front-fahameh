import AppLayout from "../../ui/AppLayout";
// import { CustomNavLink } from "../../ui/CustomNavLink";
import { CustomNavLink } from "../../ui/CustomNavlLink";

import Sidebar from "../../ui/Sidebar";
import { HiCollection, HiHome, HiUser, HiOutlineViewGrid } from "react-icons/hi";

function AdminLayout() {
  return (
    <AppLayout>
            {/* <CustomNavLink to="login">
        <HiHome className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>ورود</span>
      </CustomNavLink> */}
      <CustomNavLink to="dashboard">
        <HiHome className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>داشبورد</span>
      </CustomNavLink>
      <CustomNavLink to="registerInspection">
        <HiHome className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>ثبت درخواست بازرسی</span>
      </CustomNavLink>
      <CustomNavLink to="users">
        <HiUser className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>کاربران</span>
      </CustomNavLink>
      <CustomNavLink to="projects">
        <HiOutlineViewGrid className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>پروژه ها</span>
      </CustomNavLink>
      <CustomNavLink to="proposals">
        <HiCollection className="w-5 h-5 lg:w-4 lg:h-4" />
        <span>درخواست ها</span>
      </CustomNavLink>
    </AppLayout>
  );
}

export default AdminLayout;