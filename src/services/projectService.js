// src/services/projectService.js
import http from './httpService';

class ProjectService {
  // گرفتن لیست تمام پروژه‌ها
  async getAllProjects() {
    try {
      const response = await http.get('/projects');
      console.log('Projects API Response:', response.data);
      return this.transformProjectsData(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
    console.log('Creating new project:', projectData);
    
    // اگر API فقط title می‌خواهد
    const apiData = {
      Title: projectData.name
    };

    const response = await http.post('/create_new_project', apiData);
    console.log('Project created successfully:', response.data);
    
    // پاسخ API را به فرمت مورد نیاز تبدیل می‌کنیم
    return {
      id: response.data.id || `db-${Date.now()}`,
      name: projectData.name,
      abbreviation: projectData.abbreviation || '',
      subProject: projectData.subProject || '',
      isTemp: false
    };
  } catch (error) {
    console.error('Error creating project:', error);
    
    // **مدیریت خطاهای خاص**
    let errorMessage = 'خطا در ایجاد پروژه';
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400 || status === 409) {
        // خطای اعتبارسنجی یا تکراری بودن
        if (data.detail) {
          // بررسی اگر پیام تکراری بودن است
          if (data.detail.includes('already exists') || data.detail.includes('تکراری')) {
            errorMessage = `نام پروژه "${projectData.name}" تکراری است. لطفاً نام دیگری انتخاب کنید.`;
          } else {
            errorMessage = data.detail;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (status === 401) {
        errorMessage = 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
      } else if (status === 500) {
        errorMessage = 'خطای سرور. لطفاً دوباره تلاش کنید.';
      }
    }
    
    // ایجاد خطای جدید با پیام فارسی
    const customError = new Error(errorMessage);
    customError.originalError = error;
    customError.projectData = projectData;
    
    throw customError;
  }
}
  // **جدید: دریافت آخرین IRN برای پروژه**
  async getLastIRN(projectName, projectType) {
    try {
      console.log('Getting last IRN for:', { projectName, projectType });
      
      const params = {
        project_name: projectName,
        Over_Domestic: projectType
      };
      
      const response = await http.get('/irnno', { params });
      console.log('Last IRN API response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching last IRN:', error);
      
      // در صورت خطا، مقدار پیش‌فرض برگردان
      return {
        irnno: 0,
        next_irnno: 1
      };
    }
  }
  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformProjectsData(apiData) {
    // فرمت: { "4": "چهلستون", "5": "عمران ساحل بندرپارسیان", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    // اگر داده نامعتبر هست
    console.warn('Invalid projects data format:', apiData);
    return [];
  }
}

export default new ProjectService();