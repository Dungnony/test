import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import {
  enrollmentService,
  studentService,
  courseService,
} from "../../services";
import { CertificateStatus } from "../../types";
import type {
  IssueCertificateRequest,
  EnrollmentDTO,
  StudentDTO,
  CourseDTO,
} from "../../types";
import {
  getErrorMessage,
  getStatusDisplay,
  getStatusColorClass,
} from "../../utils/helpers";
import { formatDateTime } from "../../utils/dateUtils";

interface EnrollmentWithDetails extends EnrollmentDTO {
  studentName?: string;
  courseName?: string;
}

const CertificatesPage: React.FC = () => {
  const [pendingEnrollments, setPendingEnrollments] = useState<
    EnrollmentWithDetails[]
  >([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<
    EnrollmentWithDetails[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentWithDetails | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CertificateStatus>(
    CertificateStatus.PASS
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load pending enrollments on mount
  useEffect(() => {
    loadPendingEnrollments();
  }, []);

  // Filter enrollments when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEnrollments(pendingEnrollments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = pendingEnrollments.filter((enrollment) => {
      return (
        enrollment.studentName?.toLowerCase().includes(query) ||
        enrollment.courseName?.toLowerCase().includes(query) ||
        enrollment.id.toString().includes(query) ||
        enrollment.studentId.toString().includes(query) ||
        enrollment.courseId.toString().includes(query)
      );
    });
    setFilteredEnrollments(filtered);
  }, [searchQuery, pendingEnrollments]);

  const loadPendingEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all enrollments (or implement backend endpoint for PENDING only)
      const enrollments = await enrollmentService.getAll();

      // Filter PENDING enrollments
      const pending = enrollments.filter(
        (e) => e.status === CertificateStatus.PENDING
      );

      // Fetch student and course details
      const enriched = await Promise.all(
        pending.map(async (enrollment) => {
          try {
            const [student, course] = await Promise.all([
              studentService.getById(enrollment.studentId),
              courseService.getById(enrollment.courseId),
            ]);
            return {
              ...enrollment,
              studentName: student.name,
              courseName: course.name,
            };
          } catch (err) {
            console.error(
              `Failed to fetch details for enrollment ${enrollment.id}:`,
              err
            );
            return {
              ...enrollment,
              studentName: `ID: ${enrollment.studentId}`,
              courseName: `ID: ${enrollment.courseId}`,
            };
          }
        })
      );

      setPendingEnrollments(enriched);
      setFilteredEnrollments(enriched);
    } catch (err) {
      console.error("Error loading pending enrollments:", err);
      setError(getErrorMessage(err));
      setPendingEnrollments([]);
      setFilteredEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setSelectedStatus(CertificateStatus.PASS);
    setIsModalOpen(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
    setSelectedStatus(CertificateStatus.PASS);
  };

  const handleIssueCertificate = async () => {
    if (!selectedEnrollment) return;

    try {
      setLoading(true);
      setError("");
      const data: IssueCertificateRequest = { status: selectedStatus };
      await enrollmentService.issueCertificate(selectedEnrollment.id, data);
      setSuccess(
        `Đã cấp chứng chỉ ${
          selectedStatus === CertificateStatus.PASS ? "Đạt" : "Không đạt"
        } cho ${selectedEnrollment.studentName}!`
      );
      handleCloseModal();
      // Reload the list
      await loadPendingEnrollments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item: EnrollmentWithDetails) => (
        <span className="font-mono text-sm">{item.id}</span>
      ),
    },
    {
      key: "studentName",
      label: "Học viên",
      render: (item: EnrollmentWithDetails) => (
        <div>
          <div className="font-medium">{item.studentName}</div>
          <div className="text-xs text-gray-500">MSV: {item.studentId}</div>
        </div>
      ),
    },
    {
      key: "courseName",
      label: "Khóa học",
      render: (item: EnrollmentWithDetails) => (
        <div>
          <div className="font-medium">{item.courseName}</div>
          <div className="text-xs text-gray-500">ID: {item.courseId}</div>
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      label: "Ngày đăng ký",
      render: (item: EnrollmentWithDetails) => (
        <span className="text-sm">{formatDateTime(item.enrollmentDate)}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (item: EnrollmentWithDetails) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
            item.status
          )}`}
        >
          {getStatusDisplay(item.status)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: EnrollmentWithDetails) => (
        <Button
          onClick={() => handleOpenModal(item)}
          variant="success"
          size="sm"
        >
          Cấp chứng chỉ
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cấp chứng chỉ</h1>
          <p className="text-gray-600 mt-2">
            Danh sách học viên đã hoàn thành khóa học và chờ cấp chứng chỉ
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <Card>
          <div className="mb-4">
            <Input
              label="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, tên khóa học, ID..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Tìm kiếm theo: Tên học viên, Tên khóa học, ID đăng ký, MSV, ID
              khóa học
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? "Không tìm thấy kết quả phù hợp"
                : "Không có học viên nào chờ cấp chứng chỉ"}
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-600">
                Hiển thị {filteredEnrollments.length} /{" "}
                {pendingEnrollments.length} học viên
              </div>
              <DataTable columns={columns} data={filteredEnrollments} />
            </>
          )}
        </Card>

        {/* Issue Certificate Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Cấp chứng chỉ"
        >
          {selectedEnrollment && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">ID đăng ký:</span>
                    <div className="font-mono font-medium">
                      {selectedEnrollment.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">MSV:</span>
                    <div className="font-medium">
                      {selectedEnrollment.studentId}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Học viên:</span>
                    <div className="font-medium">
                      {selectedEnrollment.studentName}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Khóa học:</span>
                    <div className="font-medium">
                      {selectedEnrollment.courseName}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Ngày đăng ký:</span>
                    <div className="font-medium">
                      {formatDateTime(selectedEnrollment.enrollmentDate)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={CertificateStatus.PASS}
                      checked={selectedStatus === CertificateStatus.PASS}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as CertificateStatus)
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-green-700">Đạt</div>
                      <div className="text-xs text-gray-500">
                        Học viên đã hoàn thành khóa học
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={CertificateStatus.FAIL}
                      checked={selectedStatus === CertificateStatus.FAIL}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as CertificateStatus)
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-red-700">Không đạt</div>
                      <div className="text-xs text-gray-500">
                        Học viên chưa đáp ứng yêu cầu
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleCloseModal} variant="secondary">
                  Hủy
                </Button>
                <Button
                  onClick={handleIssueCertificate}
                  disabled={loading}
                  variant="success"
                >
                  {loading ? "Đang cập nhật..." : "Xác nhận cấp chứng chỉ"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default CertificatesPage;
