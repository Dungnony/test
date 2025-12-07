import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import {
  enrollmentService,
  studentService,
  courseService,
} from "../../services";
import type { StudentDTO, CourseDTO, EnrollRequest } from "../../types";
import { getErrorMessage } from "../../utils/helpers";

const EnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, coursesData] = await Promise.all([
        studentService.getAll(),
        courseService.getAll(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedStudent || !selectedCourse) {
      setError("Vui lòng chọn học viên và khóa học");
      return;
    }

    try {
      setLoading(true);
      const data: EnrollRequest = {
        studentId: parseInt(selectedStudent),
        courseId: parseInt(selectedCourse),
      };
      await enrollmentService.enroll(data);
      alert("Đăng ký học thành công!");
      navigate("/students");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký học</h1>
          <p className="text-gray-600 mt-2">Đăng ký học viên vào khóa học</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn học viên <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">-- Chọn học viên --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.msv} - {student.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn khóa học <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.content}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/students")}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
