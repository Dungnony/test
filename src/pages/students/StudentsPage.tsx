import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import { studentService, enrollmentService } from "../../services";
import type { StudentDTO } from "../../types";
import { formatDate } from "../../utils/dateUtils";
import { isAdmin } from "../../utils/roleUtils";
import { useAppSelector } from "../../redux/hooks";
import { getErrorMessage } from "../../utils/helpers";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { role } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (s) =>
          s.msv.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.ho.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.ten.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa học viên này?")) {
      return;
    }

    try {
      // Kiểm tra trước khi xóa: nếu sinh viên có đăng ký khóa học chưa hoàn thành thì chặn xóa
      try {
        const enrollmentsRes = await enrollmentService.getAll();
        const hasIncompleteEnrollments =
          Array.isArray(enrollmentsRes?.data) &&
          enrollmentsRes.data.some(
            (e: any) => e?.studentId === id && e?.certificateStatus !== "PASS"
          );
        if (hasIncompleteEnrollments) {
          alert(
            "Sinh viên này đang có khóa học chưa hoàn thành vui lòng thực hiện chức năng này sau"
          );
          return;
        }
      } catch (preErr) {
        // Nếu bước kiểm tra thất bại, vẫn thử gọi xóa và dựa vào phản hồi từ server
      }

      const response = await studentService.delete(id);
      if (response?.status === 401) {
        alert(
          "Sinh viên này đang có khóa học chưa hoàn thành vui lòng thực hiện chức năng này sau"
        );
        return;
      }
      if (response?.status === 409) {
        alert(
          response?.data?.message ||
            "Sinh viên này đang có khóa học chưa hoàn thành vui lòng thực hiện chức năng này sau"
        );
        return;
      }
      await loadStudents();
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 401) {
        alert(
          "Sinh viên này đang có khóa học chưa hoàn thành vui lòng thực hiện chức năng này sau"
        );
      } else if (status === 409) {
        alert(
          data?.message ||
            "Sinh viên này đang có khóa học chưa hoàn thành vui lòng thực hiện chức năng này sau"
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-600 mt-2">
            Tổng số:{" "}
            <span className="font-semibold">{filteredStudents.length}</span> học
            viên
          </p>
        </div>
        {isAdmin(role) && (
          <Link to="/students/new">
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
              Thêm học viên
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã học viên, họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "Không tìm thấy học viên nào"
              : "Chưa có học viên nào"}
          </div>
        ) : (
          <Table
            headers={[
              "Mã HV",
              "Họ và tên",
              "Ngày sinh",
              "Quê quán",
              "Tỉnh thường trú",
              "Thao tác",
            ]}
          >
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.msv}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(student.dateOfBirth)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.hometown}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.residenceProvince}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/students/${student.id}/history`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Lịch sử
                  </Link>
                  {isAdmin(role) && (
                    <>
                      <Link
                        to={`/students/${student.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
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

export default StudentsPage;
