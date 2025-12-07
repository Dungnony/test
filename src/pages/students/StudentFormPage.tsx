import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { studentService } from "../../services";
import type { CreateStudentRequest, UpdateStudentRequest } from "../../types";
import { getErrorMessage } from "../../utils/helpers";

const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CreateStudentRequest>({
    ho: "",
    ten: "",
    dateOfBirth: "",
    hometown: "",
    residenceProvince: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadStudent(parseInt(id));
    }
  }, [id, isEdit]);

  const loadStudent = async (studentId: number) => {
    try {
      const student = await studentService.getById(studentId);
      setFormData({
        ho: student.ho,
        ten: student.ten,
        dateOfBirth: student.dateOfBirth,
        hometown: student.hometown,
        residenceProvince: student.residenceProvince,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.ho || !formData.ten || !formData.dateOfBirth) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await studentService.update(
          parseInt(id),
          formData as UpdateStudentRequest
        );
      } else {
        await studentService.create(formData);
      }
      navigate("/students");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa học viên" : "Thêm học viên mới"}
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <Input
              label="Họ"
              name="ho"
              value={formData.ho}
              onChange={handleChange}
              required
            />

            <Input
              label="Tên"
              name="ten"
              value={formData.ten}
              onChange={handleChange}
              required
            />

            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />

            <Input
              label="Quê quán"
              name="hometown"
              value={formData.hometown}
              onChange={handleChange}
            />

            <Input
              label="Tỉnh thường trú"
              name="residenceProvince"
              value={formData.residenceProvince}
              onChange={handleChange}
            />

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
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

export default StudentFormPage;
