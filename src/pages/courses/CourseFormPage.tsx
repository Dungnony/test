import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { courseService, chapterService } from "../../services";
import type {
  CreateCourseRequest,
  UpdateCourseRequest,
  ChapterDTO,
} from "../../types";
import { getErrorMessage } from "../../utils/helpers";
import { toISODateTime, fromISODateTime } from "../../utils/dateUtils";

const CourseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    courseCode: "",
    startDate: "",
    endDate: "",
    content: "",
  });
  const [chapterCount, setChapterCount] = useState<number>(0);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapters, setChapters] = useState<ChapterDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadCourse(parseInt(id));
    }
  }, [id, isEdit]);

  const loadCourse = async (courseId: number) => {
    try {
      const course = await courseService.getById(courseId);
      setFormData({
        courseCode: course.courseCode,
        startDate: fromISODateTime(course.startDate),
        endDate: fromISODateTime(course.endDate),
        content: course.content,
      });

      // Load các chương hiện có
      const existingChapters = await chapterService.getByCourse(courseId);
      setChapters(existingChapters);
      setChapterCount(existingChapters.length);
      if (existingChapters.length > 0) {
        setShowChapterForm(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.courseCode || !formData.startDate || !formData.endDate) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const data = {
        courseCode: formData.courseCode,
        startDate: toISODateTime(formData.startDate),
        endDate: toISODateTime(formData.endDate),
        content: formData.content,
      };

      let courseId: number;
      if (isEdit && id) {
        await courseService.update(parseInt(id), data as UpdateCourseRequest);
        courseId = parseInt(id);
      } else {
        const newCourse = await courseService.create(
          data as CreateCourseRequest
        );
        courseId = newCourse.id;
      }

      // Lưu / tạo các chương
      if (showChapterForm && chapters.length > 0) {
        if (!isEdit) {
          // Tạo mới các chương rỗng trước, sau đó cập nhật title/content người dùng đã nhập
          const createdChapters = await chapterService.createChapters({
            courseId: courseId,
            chapterCount: chapters.length,
          });

          // Map theo number để cập nhật nội dung
          for (const created of createdChapters) {
            const local = chapters.find((c) => c.number === created.number);
            if (!local) continue;
            // Chỉ update nếu người dùng đã nhập ít nhất một trong hai trường
            if (
              (local.title && local.title.trim() !== "") ||
              (local.content && local.content.trim() !== "")
            ) {
              await chapterService.update(created.id, {
                id: created.id,
                number: created.number,
                title: local.title,
                content: local.content,
              });
            }
          }
        } else {
          // Chỉnh sửa: chỉ update những chương đã có id
          for (const chapter of chapters) {
            if (chapter.id) {
              await chapterService.update(chapter.id, chapter);
            }
          }
        }
      }

      navigate("/courses");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapters = async () => {
    if (chapterCount <= 0) {
      setError("Số chương phải lớn hơn 0");
      return;
    }

    if (!isEdit || !id) {
      // Nếu đang tạo mới, chỉ tạo form trống
      const newChapters: ChapterDTO[] = Array.from(
        { length: chapterCount },
        (_, i) => ({
          id: 0,
          number: i + 1,
          title: "",
          content: "",
        })
      );
      setChapters(newChapters);
      setShowChapterForm(true);
      return;
    }

    // Nếu đang chỉnh sửa, gọi API tạo chương
    try {
      setLoading(true);
      const createdChapters = await chapterService.createChapters({
        courseId: parseInt(id),
        chapterCount,
      });
      setChapters(createdChapters);
      setShowChapterForm(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChapterChange = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    setChapters((prev) =>
      prev.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch))
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <Input
              label="Mã khóa học"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />

            <Input
              label="Thời gian bắt đầu"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Thời gian kết thúc"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung khóa học
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Số chương */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số chương
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  value={chapterCount}
                  onChange={(e) =>
                    setChapterCount(parseInt(e.target.value) || 0)
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nhập số"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateChapters}
                  disabled={loading || chapterCount <= 0}
                >
                  {isEdit ? "Tạo chương" : "Tạo form nhập chương"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isEdit
                  ? "Nhập số chương và nhấn nút để tạo các chương cho khóa học này."
                  : "Nhập số chương, sau khi lưu khóa học sẽ có thể nhập chi tiết các chương."}
              </p>
            </div>

            {/* Form nhập thông tin từng chương */}
            {showChapterForm && chapters.length > 0 && (
              <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Thông tin các chương
                </h3>
                <div className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-800 mb-2">
                        Chương {chapter.number}
                      </h4>
                      <Input
                        label="Tên chương"
                        value={chapter.title}
                        onChange={(e) =>
                          handleChapterChange(index, "title", e.target.value)
                        }
                        placeholder="Nhập tên chương"
                      />
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nội dung chương
                        </label>
                        <textarea
                          value={chapter.content}
                          onChange={(e) =>
                            handleChapterChange(
                              index,
                              "content",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Nhập nội dung chương"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                onClick={() => navigate("/courses")}
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

export default CourseFormPage;
