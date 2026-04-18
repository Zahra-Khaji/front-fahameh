import http from "./httpService";

class ProjectService {
  // گرفتن لیست تمام پروژه‌ها
  async getAllProjects(onlyActive = true) {
    try {
      const response = await http.get("/projects/", {
        params: {
          only_active: onlyActive
        }
      });
      console.log(`Projects API Response (only_active=${onlyActive}):`, response.data);
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

  // ایجاد پروژه جدید - با فیلدهای کامل
  async createProject(projectData) {
    try {
      // داده‌ها را به فرمت مورد نیاز API تبدیل می‌کنیم
      const apiData = {
        Title: projectData.Title,
        project_code: projectData.project_code || null,
        Abbreviation: projectData.Abbreviation || null,
        SubProject: projectData.SubProject || null,
        Material_Code: projectData.Material_Code || null,
        Remark: projectData.Remark || null
      };

      console.log("📤 Creating project with data:", apiData);

      const response = await http.post("/projects/projects", apiData);
      console.log("✅ Project created successfully:", response.data);

      // تبدیل پاسخ به فرمت استاندارد
      const apiResponse = response.data;
      
      const newProject = {
        id: apiResponse.data?.toString() || apiResponse.id || `temp-${Date.now()}`,
        name: projectData.Title,
        Title: projectData.Title,
        project_code: projectData.project_code,
        Abbreviation: projectData.Abbreviation,
        SubProject: projectData.SubProject,
        Material_Code: projectData.Material_Code,
        Remark: projectData.Remark,
        actualId: apiResponse.data || apiResponse.id,
        isTemp: false,
        isNew: true,
      };

      return newProject;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      
      let errorMessage = "خطا در ایجاد پروژه";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 || status === 409) {
          if (data.detail) {
            if (data.detail.includes("already exists") || data.detail.includes("تکراری")) {
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

  // **جدید: بروزرسانی پروژه**
  async updateProject(id, projectData) {
    try {
      // داده‌ها را به فرمت مورد نیاز API تبدیل می‌کنیم
      const apiData = {
        Title: projectData.Title,
        project_code: projectData.project_code || null,
        Abbreviation: projectData.Abbreviation || null,
        SubProject: projectData.SubProject || null,
        Material_Code: projectData.Material_Code || null,
        Remark: projectData.Remark || null
      };

      console.log(`📤 Updating project ${id} with data:`, apiData);

      const response = await http.put(`/projects/projects/${id}`, apiData);
      console.log("✅ Project updated successfully:", response.data);

      // تبدیل پاسخ به فرمت استاندارد
      const updatedProject = {
        id: id,
        name: projectData.Title,
        Title: projectData.Title,
        project_code: projectData.project_code,
        Abbreviation: projectData.Abbreviation,
        SubProject: projectData.SubProject,
        Material_Code: projectData.Material_Code,
        Remark: projectData.Remark,
        actualId: id,
        isTemp: false,
        isNew: false,
      };

      return updatedProject;
    } catch (error) {
      console.error(`❌ Error updating project ${id}:`, error);
      
      let errorMessage = "خطا در بروزرسانی پروژه";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 || status === 404 || status === 409) {
          if (data.detail) {
            if (data.detail.includes("not found")) {
              errorMessage = `پروژه با شناسه ${id} یافت نشد.`;
            } else if (data.detail.includes("already exists") || data.detail.includes("تکراری")) {
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

  async deleteProject(id) {
    try {
      console.log(`🗑️ Deleting project with ID: ${id}`);
      
      // توجه: برای حذف فقط نیاز به ID داریم، نیازی به ارسال body نیست
      const response = await http.delete(`/projects/projects/${id}`);
      
      console.log("✅ Project deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting project ${id}:`, error);
      
      let errorMessage = "خطا در حذف پروژه";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          errorMessage = "پروژه مورد نظر یافت نشد.";
        } else if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
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
      throw customError;
    }
  }


  // دریافت آخرین IRN برای پروژه
  async getLastIRN(projectName, projectType) {
    try {
      const params = {
        project_name: projectName,
        Over_Domestic: projectType,
      };

      const response = await http.get(
        `/projects/${projectName}/irnno?Over_Domestic=${projectType}`
      );

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
      return Object.entries(apiData).map(([id, project]) => {
        // اگر project یک شیء است (با فیلدهای مختلف)
        if (typeof project === "object" && project !== null) {
          return {
            id: id.toString(),
            name: project.Title || project.name || "بدون نام",
            Title: project.Title || project.name || "بدون نام",
            project_code: project.project_code || "",
            Abbreviation: project.Abbreviation || "",
            SubProject: project.SubProject || "",
            Material_Code: project.Material_Code || "",
            Remark: project.Remark || "",
            actualId: id.toString(),
            isTemp: false,
            isNew: false,
          };
        }
        
        // اگر فقط یک string است (برای سازگاری با نسخه قبلی)
        return {
          id: id.toString(),
          name: project || "بدون نام",
          Title: project || "بدون نام",
          project_code: "",
          Abbreviation: "",
          SubProject: "",
          Material_Code: "",
          Remark: "",
          actualId: id.toString(),
          isTemp: false,
          isNew: false,
        };
      });
    }

    console.warn("Invalid projects data format:", apiData);
    return [];
  }
}

export default new ProjectService();