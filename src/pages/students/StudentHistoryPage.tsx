import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { studentService } from "../../services";
import type { EnrollmentHistoryDTO } from "../../types";
import { formatDateTime } from "../../utils/dateUtils";
import {
  getStatusDisplay,
  getStatusColorClass,
  getErrorMessage,
} from "../../utils/helpers";

const StudentHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<EnrollmentHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadHistory(parseInt(id));
    }
  }, [id]);

  const loadHistory = async (studentId: number) => {
    try {
      const data = await studentService.getHistory(studentId);
      setHistory(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-gray-600 mb-4">
          <Link to="/students" className="hover:text-primary-600">
            Học viên
          </Link>
          <span>/</span>
          <span className="text-gray-900">Lịch sử học</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Lịch sử học của học viên
        </h1>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Học viên chưa đăng ký khóa học nào
          </div>
        ) : (
          <Table
            headers={[
              "ID đăng ký",
              "Mã khóa học",
              "Nội dung",
              "Ngày đăng ký",
              "Thời gian học",
              "Trạng thái",
              "Chi tiết",
            ]}
          >
            {history.map((item) => (
              <tr key={item.enrollmentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.enrollmentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.courseCode}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.courseContent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(item.enrollmentDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(item.courseStartDate)} -{" "}
                  {formatDateTime(item.courseEndDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                      item.status
                    )}`}
                  >
                    {getStatusDisplay(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/courses/${item.courseId}/${item.enrollmentId}/detail`}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Xem chương →
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Layout>
  );
};

export default StudentHistoryPage;
