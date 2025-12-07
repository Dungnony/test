import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  courseService,
  chapterService,
  enrollmentService,
} from "../../services";
import { useAppSelector } from "../../redux/hooks";
import type { CourseDTO, ChapterProgressDTO } from "../../types";
import { getErrorMessage } from "../../utils/helpers";
import { isAdmin } from "../../utils/roleUtils";

const CourseDetailPage: React.FC = () => {
  const { courseId, enrollmentId } = useParams<{
    courseId: string;
    enrollmentId: string;
  }>();
  const navigate = useNavigate();
  const { role } = useAppSelector((state) => state.auth);

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [chapters, setChapters] = useState<ChapterProgressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId, enrollmentId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError("");

      let actualCourseId = courseId ? parseInt(courseId, 10) : null;

      // Nếu không có courseId nhưng có enrollmentId, lấy từ enrollment
      if (!actualCourseId && enrollmentId) {
        try {
          const progress = await enrollmentService.getProgress(
            parseInt(enrollmentId)
          );
          if (progress && progress.length > 0) {
            // Lấy courseId từ backend nếu có (cần backend trả về)
            // Tạm thời skip nếu không lấy được
          }
        } catch (err) {
          console.error("Không lấy được courseId từ enrollment:", err);
        }
      }

      if (!actualCourseId) {
        setError("Không tìm thấy thông tin khóa học");
        setLoading(false);
        return;
      }

      const courseData = await courseService.getById(actualCourseId);
      setCourse(courseData);

      // Nếu có enrollmentId, lấy tiến độ hoàn thành chương
      if (enrollmentId) {
        try {
          const progress = await enrollmentService.getProgress(
            parseInt(enrollmentId)
          );
          setChapters(progress || []);
        } catch (progressErr) {
          console.error("Lỗi khi lấy tiến độ:", progressErr);
          // Nếu lỗi, thử lấy danh sách chương thông thường
          try {
            const chaptersData = await chapterService.getByCourse(
              actualCourseId
            );
            setChapters(
              chaptersData.map((ch) => ({
                chapterId: ch.id,
                number: ch.number,
                title: ch.title,
                completed: false,
              }))
            );
          } catch (chapterErr) {
            console.error("Lỗi khi lấy chương:", chapterErr);
            setChapters([]);
          }
        }
      } else {
        // Nếu không có enrollmentId (admin xem), chỉ lấy danh sách chương
        try {
          const chaptersData = await chapterService.getByCourse(actualCourseId);
          setChapters(
            chaptersData.map((ch) => ({
              chapterId: ch.id,
              number: ch.number,
              title: ch.title,
              completed: false,
            }))
          );
        } catch (chapterErr) {
          console.error("Lỗi khi lấy chương:", chapterErr);
          setChapters([]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi load course detail:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChapter = async (
    chapterId: number,
    currentlyCompleted: boolean
  ) => {
    if (isAdmin(role) || !enrollmentId) {
      // Admin không được tích
      return;
    }

    if (currentlyCompleted) {
      // Đã hoàn thành rồi, không cho bỏ tích
      return;
    }

    try {
      setSubmitting(true);
      await enrollmentService.completeChapter({
        enrollmentId: parseInt(enrollmentId),
        chapterId,
      });

      // Reload để cập nhật trạng thái
      await loadCourseDetail();

      // Kiểm tra nếu hoàn thành hết thì thông báo
      const allCompleted = chapters.every(
        (ch) => ch.chapterId === chapterId || ch.completed
      );
      if (allCompleted) {
        alert(
          "Chúc mừng! Bạn đã hoàn thành tất cả các chương. Trạng thái khóa học đã được cập nhật."
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" className="mt-20" />
      </Layout>
    );
  }

  if (error && !course) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto mt-20">
          <Card>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const allCompleted =
    chapters.length > 0 && chapters.every((ch) => ch.completed);
  const completedCount = chapters.filter((ch) => ch.completed).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course?.courseCode} - {course?.content}
            </h1>
            <p className="text-gray-600 mt-2">
              Thời gian:{" "}
              {new Date(course?.startDate || "").toLocaleDateString("vi-VN")} -{" "}
              {new Date(course?.endDate || "").toLocaleDateString("vi-VN")}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>

        {error && (
          <Card className="mb-4">
            <div className="p-3 bg-yellow-50 border border-yellow-400 text-yellow-700 rounded-lg">
              {error}
            </div>
          </Card>
        )}

        {chapters.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              Khóa học này chưa có chương nào.
            </div>
          </Card>
        ) : (
          <>
            {/* Progress bar */}
            <Card className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Tiến độ học tập
                </span>
                <span className="text-gray-600">
                  {completedCount}/{chapters.length} chương
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    allCompleted ? "bg-green-600" : "bg-blue-600"
                  }`}
                  style={{
                    width: `${
                      chapters.length > 0
                        ? (completedCount / chapters.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              {allCompleted && (
                <p className="mt-2 text-green-700 font-medium text-center">
                  ✓ Đã hoàn thành tất cả các chương!
                </p>
              )}
            </Card>

            {/* Danh sách chương */}
            <Card title="Danh sách chương">
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.chapterId}
                    className={`flex items-start p-4 border rounded-lg transition-colors ${
                      chapter.completed
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {!isAdmin(role) && enrollmentId && (
                      <input
                        type="checkbox"
                        checked={chapter.completed}
                        onChange={() =>
                          handleToggleChapter(
                            chapter.chapterId,
                            chapter.completed
                          )
                        }
                        disabled={submitting || chapter.completed}
                        className="mt-1 mr-4 w-5 h-5 text-green-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900 mr-2">
                          Chương {chapter.number}:
                        </span>
                        <span className="font-medium text-gray-800">
                          {chapter.title || "(Chưa có tiêu đề)"}
                        </span>
                        {chapter.completed && (
                          <span className="ml-auto text-green-600 text-sm font-medium">
                            ✓ Đã hoàn thành
                          </span>
                        )}
                      </div>
                      {chapter.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Hoàn thành lúc:{" "}
                          {new Date(chapter.completedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
