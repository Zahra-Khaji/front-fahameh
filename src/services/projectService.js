import http from "./httpService";

class ProjectService {
  // گرفتن لیست تمام پروژه‌ها
  async getAllProjects() {
    try {
      const response = await http.get("/projects");
      // console.log("Projects API Response:", response.data);
      return this.transformProjectsData(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک پروژه خاص
  async getProjectById(id) {
    try {
      const response = await http.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  // **افزودن پروژه جدید**
  async createProject(projectData) {
    try {
      // console.log("Creating new project:", projectData);

      // **ارسال داده به فرمت مورد نیاز بک‌اند**
      const apiData = {
        Title: projectData.Title,
        project_code: projectData.project_code,
      };

      // console.log("📤 Sending to API:", apiData);

      const response = await http.post("/projects/projects", apiData);
      // console.log("✅ Project created successfully:", response.data);

      // **تغییر مهم: استفاده از ID واقعی از API**
      const apiResponse = response.data;

      // ایجاد پروژه جدید با ID واقعی
      const newProject = {
        id:
          apiResponse.data?.toString() ||
          apiResponse.message?.match(/\d+/) ||
          `temp-${Date.now()}`,
        name: projectData.Title,
        project_code: projectData.project_code,
        // **اضافه کردن دو فیلد جدید برای سرویس نوتیفیکیشن**
        actualId: apiResponse.data || apiResponse.id, // ID عددی واقعی
        isTemp: false,
        isNew: true, // پرچم برای تشخیص پروژه جدید
      };

      // console.log("📦 Formatted project:", newProject);
      return newProject;
    } catch (error) {
      console.error("❌ Error creating project:", error);

      let errorMessage = "خطا در ایجاد پروژه";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 || status === 409) {
          if (data.detail) {
            if (
              data.detail.includes("already exists") ||
              data.detail.includes("تکراری")
            ) {
              if (data.detail.includes("Title")) {
                errorMessage = `نام پروژه "${projectData.Title}" تکراری است.`;
              } else if (data.detail.includes("project_code")) {
                errorMessage = `کد پروژه "${projectData.project_code}" تکراری است.`;
              } else {
                errorMessage = data.detail;
              }
            } else {
              errorMessage = data.detail;
            }
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }

      const customError = new Error(errorMessage);
      customError.originalError = error;
      customError.projectData = projectData;

      throw customError;
    }
  }

  // دریافت آخرین IRN برای پروژه
  async getLastIRN(projectName, projectType) {
    try {
      // console.log("Getting last IRN for:", { projectName, projectType });

      const params = {
        project_name: projectName,
        Over_Domestic: projectType,
      };

      // const response = await http.get("/irnno", { params });
      // const response = await http.get(`/projects/${projectName}/irnno?type=${projectType}`);
      const response = await http.get(
        `/projects/${projectName}/irnno?Over_Domestic=${projectType}`
      );
      // console.log("Last IRN API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching last IRN:", error);

      return {
        irnno: 0,
        next_irnno: 1,
        rfi_numer: 0,
      };
    }
  }

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformProjectsData(apiData) {
    if (typeof apiData === "object" && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || "بدون نام",
        // برای پروژه‌های موجود از API
        actualId: id.toString(),
        isTemp: false,
        isNew: false,
      }));
    }

    console.warn("Invalid projects data format:", apiData);
    return [];
  }
}

export default new ProjectService();
