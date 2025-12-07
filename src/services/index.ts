import apiClient from "./api";
import type {
  LoginRequest,
  JwtResponse,
  StudentDTO,
  CreateStudentRequest,
  UpdateStudentRequest,
  CourseDTO,
  CreateCourseRequest,
  UpdateCourseRequest,
  EnrollmentDTO,
  EnrollRequest,
  IssueCertificateRequest,
  EnrollmentHistoryDTO,
  CourseStatsDTO,
  DashboardSummaryDTO,
  ProvinceStats,
  ChapterDTO,
  CreateChaptersRequest,
  ChapterCompletionRequest,
  ChapterProgressDTO,
} from "../types";

// ============ Auth Service ============
export const authService = {
  login: async (data: LoginRequest): Promise<JwtResponse> => {
    const response = await apiClient.post<JwtResponse>("/auth/login", data);
    return response.data;
  },

  // Note: Register endpoint not available in backend yet
  // register: async (data: RegisterRequest): Promise<void> => {
  //   await apiClient.post('/auth/register', data);
  // },
};

// ============ Student Service ============
export const studentService = {
  getAll: async (search?: string): Promise<StudentDTO[]> => {
    const response = await apiClient.get<StudentDTO[]>("/v1/students", {
      params: { search },
    });
    return response.data;
  },

  getById: async (id: number): Promise<StudentDTO> => {
    const response = await apiClient.get<StudentDTO>(`/v1/students/${id}`);
    return response.data;
  },

  create: async (data: CreateStudentRequest): Promise<StudentDTO> => {
    const response = await apiClient.post<StudentDTO>("/v1/students", data);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateStudentRequest
  ): Promise<StudentDTO> => {
    const response = await apiClient.put<StudentDTO>(
      `/v1/students/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/students/${id}`);
  },

  getHistory: async (studentId: number): Promise<EnrollmentHistoryDTO[]> => {
    const response = await apiClient.get<EnrollmentHistoryDTO[]>(
      `/v1/students/${studentId}/history`
    );
    return response.data;
  },
};

// ============ Course Service ============
export const courseService = {
  getAll: async (): Promise<CourseDTO[]> => {
    const response = await apiClient.get<CourseDTO[]>("/v1/courses");
    return response.data;
  },

  getById: async (id: number): Promise<CourseDTO> => {
    const response = await apiClient.get<CourseDTO>(`/v1/courses/${id}`);
    return response.data;
  },

  create: async (data: CreateCourseRequest): Promise<CourseDTO> => {
    const response = await apiClient.post<CourseDTO>("/v1/courses", data);
    return response.data;
  },

  update: async (id: number, data: UpdateCourseRequest): Promise<CourseDTO> => {
    const response = await apiClient.put<CourseDTO>(`/v1/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/courses/${id}`);
  },
};

// ============ Enrollment Service ============
export const enrollmentService = {
  getAll: async (): Promise<EnrollmentDTO[]> => {
    const response = await apiClient.get<EnrollmentDTO[]>("/v1/enrollments");
    return response.data;
  },

  enroll: async (data: EnrollRequest): Promise<EnrollmentDTO> => {
    const response = await apiClient.post<EnrollmentDTO>(
      "/v1/enrollments",
      data
    );
    return response.data;
  },

  issueCertificate: async (
    enrollmentId: number,
    data: IssueCertificateRequest
  ): Promise<EnrollmentDTO> => {
    const response = await apiClient.put<EnrollmentDTO>(
      `/v1/enrollments/${enrollmentId}/certificate`,
      data
    );
    return response.data;
  },

  completeChapter: async (data: ChapterCompletionRequest): Promise<void> => {
    await apiClient.post("/v1/enrollments/complete-chapter", data);
  },

  getProgress: async (enrollmentId: number): Promise<ChapterProgressDTO[]> => {
    const response = await apiClient.get<ChapterProgressDTO[]>(
      `/v1/enrollments/${enrollmentId}/progress`
    );
    return response.data;
  },
};

// ============ Chapter Service ============
export const chapterService = {
  createChapters: async (
    data: CreateChaptersRequest
  ): Promise<ChapterDTO[]> => {
    const response = await apiClient.post<ChapterDTO[]>("/v1/chapters", data);
    return response.data;
  },

  getByCourse: async (courseId: number): Promise<ChapterDTO[]> => {
    const response = await apiClient.get<ChapterDTO[]>(
      `/v1/chapters/course/${courseId}`
    );
    return response.data;
  },

  update: async (chapterId: number, data: ChapterDTO): Promise<ChapterDTO> => {
    const response = await apiClient.put<ChapterDTO>(
      `/v1/chapters/${chapterId}`,
      data
    );
    return response.data;
  },
};

// ============ Statistics Service ============
export const statisticsService = {
  getStudentsByProvince: async (): Promise<ProvinceStats> => {
    const response = await apiClient.get<ProvinceStats>(
      "/v1/stats/students-by-province"
    );
    return response.data;
  },

  getCoursesByYear: async (year: number): Promise<CourseStatsDTO> => {
    const response = await apiClient.get<CourseStatsDTO>(
      "/v1/stats/courses-by-year",
      {
        params: { year },
      }
    );
    return response.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummaryDTO> => {
    const response = await apiClient.get<DashboardSummaryDTO>(
      "/v1/stats/dashboard-summary"
    );
    return response.data;
  },
};
