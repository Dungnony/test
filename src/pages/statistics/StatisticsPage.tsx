import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import { statisticsService } from "../../services";
import type { ProvinceStats, CourseStatsDTO } from "../../types";
import { getErrorMessage } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const StatisticsPage: React.FC = () => {
  const [provinceStats, setProvinceStats] = useState<ProvinceStats>({});
  const [yearStats, setYearStats] = useState<CourseStatsDTO | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStatistics();
  }, [selectedYear]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [provinceData, yearData] = await Promise.all([
        statisticsService.getStudentsByProvince(),
        statisticsService.getCoursesByYear(selectedYear),
      ]);
      setProvinceStats(provinceData);
      setYearStats(yearData);
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

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
        <p className="text-gray-600 mt-2">Thống kê học viên và khóa học</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Province Statistics */}
        <Card title="Thống kê học viên theo tỉnh">
          {Object.keys(provinceStats).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(provinceStats)
                .sort(([, a], [, b]) => b - a)
                .map(([province, count]) => (
                  <div
                    key={province}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <span className="text-gray-700 font-medium">
                      {province}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (count /
                                Math.max(...Object.values(provinceStats))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Year Statistics */}
        <Card title="Thống kê khóa học đã đăng kí theo năm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn năm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {yearStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                <span className="text-gray-600">Số khóa học</span>
                <span className="text-2xl font-bold text-gray-900">
                  {yearStats.totalCourses}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                <span className="text-gray-600">Số học viên đã đăng kí</span>
                <span className="text-2xl font-bold text-gray-900">
                  {yearStats.totalStudentsEnrolled}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-yellow-50 px-4 rounded-lg">
                <span className="text-yellow-700 font-medium">
                  Đã hoàn Thành chờ xử lí
                </span>
                <span className="text-2xl font-bold text-yellow-800">
                  {yearStats.totalPending ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                <span className="text-blue-700 font-medium">
                  Chưa Hoàn Thành
                </span>
                <span className="text-2xl font-bold text-blue-800">
                  {yearStats.totalInProgress ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                <span className="text-green-700 font-medium">Đạt</span>
                <span className="text-2xl font-bold text-green-800">
                  {yearStats.totalPass}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-red-50 px-4 rounded-lg">
                <span className="text-red-700 font-medium">Không đạt</span>
                <span className="text-2xl font-bold text-red-800">
                  {yearStats.totalFail}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default StatisticsPage;
