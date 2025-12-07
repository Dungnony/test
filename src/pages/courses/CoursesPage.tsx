import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { courseService, enrollmentService } from "../../services";
import type { CourseDTO } from "../../types";
import { formatDateTime } from "../../utils/dateUtils";
import { isAdmin } from "../../utils/roleUtils";
import { useAppSelector } from "../../redux/hooks";
import { getErrorMessage } from "../../utils/helpers";

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { role } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      return;
    }

    try {
      // Kiểm tra trước khi xóa: nếu có học sinh đăng ký khóa này thì chặn xóa và thông báo
      try {
        const enrollmentsRes = await enrollmentService.getAll();
        const hasEnrollments =
          Array.isArray(enrollmentsRes?.data) &&
          enrollmentsRes.data.some((e: any) => e?.courseId === id);
        if (hasEnrollments) {
          alert(
            "Khóa Học này đang có học sinh đăng kí vui lòng thực hiện chức năng này sau"
          );
          return;
        }
      } catch (preErr) {
        // Nếu bước kiểm tra thất bại, vẫn thử gọi xóa và dựa vào phản hồi từ server
      }

      const response = await courseService.delete(id);
      if (response?.status === 401) {
        // Không tự đăng xuất, hiển thị thông báo thân thiện và giữ nguyên trang
        alert(
          "Khóa Học này đang có học sinh đăng kí vui lòng thực hiện chức năng này sau"
        );
        return;
      }
      if (response?.status === 409) {
        alert(
          response?.data?.message ||
            "Khóa Học này đang có học sinh đăng kí vui lòng thực hiện chức năng này sau"
        );
        return;
      }
      await loadCourses();
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 401) {
        // Không tự đăng xuất, hiển thị thông báo thân thiện và giữ nguyên trang
        alert(
          "Khóa Học này đang có học sinh đăng kí vui lòng thực hiện chức năng này sau"
        );
      } else if (status === 409) {
        alert(
          data?.message ||
            "Khóa Học này đang có học sinh đăng kí vui lòng thực hiện chức năng này sau"
        );
      } else {
        alert(getErrorMessage(err));
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" className="mt-20" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-2">
            Tổng số: <span className="font-semibold">{courses.length}</span>{" "}
            khóa học
          </p>
        </div>
        {isAdmin(role) && (
          <Link to="/courses/new">
            <Button>
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Thêm khóa học
            </Button>
          </Link>
        )}
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có khóa học nào
          </div>
        ) : (
          <Table
            headers={[
              "Mã khóa",
              "Thời gian bắt đầu",
              "Thời gian kết thúc",
              "Nội dung",
              "Thao tác",
            ]}
          >
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.courseCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(course.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(course.endDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {course.content || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {isAdmin(role) && (
                    <>
                      <Link
                        to={`/courses/${course.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Layout>
  );
};

export default CoursesPage;
