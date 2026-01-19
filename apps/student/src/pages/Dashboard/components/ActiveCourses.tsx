import { Link } from 'react-router-dom'
import { ArrowRight, Play, BookOpen } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { ActiveCourse } from '@/types/student'

interface ActiveCoursesProps {
  courses: ActiveCourse[]
}

export function ActiveCourses({ courses }: ActiveCoursesProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No active courses yet</p>
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Continue Learning</CardTitle>
        <Link
          to="/courses"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <span>All courses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}/lessons/${course.currentLessonId}`}
            className="block"
          >
            <div className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-colors card-interactive">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{course.title}</h3>
                  <Badge variant={course.language === 'javascript' ? 'warning' : 'primary'} size="sm">
                    {course.language === 'javascript' ? 'JS' : 'PY'}
                  </Badge>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-600 ml-0.5" />
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-3">
                {course.currentSection}
              </p>

              <div className="flex items-center gap-3">
                <ProgressBar
                  value={course.progressPercent}
                  max={100}
                  size="sm"
                  color="secondary"
                  className="flex-1"
                />
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                  {course.lessonsCompleted}/{course.totalLessons}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
