'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateCurriculumOutline, issueCertificate, analyzeCoursePerformance,
  scoreQuiz, type Course, type StudentProgress, type Quiz,
} from '@/lib/platform/course-engine';

const DEMO_QUIZ: Quiz = {
  id: 'q1',
  questions: [
    { id: 'q1_1', text: 'What is the best time to post on Instagram?', type: 'multiple-choice', options: ['6am', '11am', '8pm', '3am'], correctAnswer: '11am', explanation: '11am weekdays shows highest engagement rates.', points: 10 },
    { id: 'q1_2', text: 'Email marketing has the highest ROI of any channel.', type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Email averages $42 ROI per $1 spent.', points: 10 },
  ],
  passingScore: 70,
  attempts: 3,
  randomizeQuestions: false,
};

const MOCK_COURSES: Course[] = [
  { id: 'course_1', title: 'Creator Business Masterclass', slug: 'creator-masterclass', description: 'Everything you need to build a profitable creator business', niche: 'business', price: 497, status: 'published', modules: generateCurriculumOutline('business', 4), totalLessons: 24, totalDurationMinutes: 480, enrollmentCount: 234, completionRate: 67, avgRating: 4.8, dripEnabled: true, dripIntervalDays: 7, certificateEnabled: true, createdAt: Date.now() - 90 * 86_400_000 },
  { id: 'course_2', title: 'Fitness Coach Blueprint', slug: 'fitness-coach', description: 'Build your online fitness coaching business', niche: 'fitness', price: 297, status: 'published', modules: generateCurriculumOutline('fitness', 3), totalLessons: 18, totalDurationMinutes: 360, enrollmentCount: 89, completionRate: 54, avgRating: 4.6, dripEnabled: false, dripIntervalDays: 0, certificateEnabled: true, createdAt: Date.now() - 30 * 86_400_000 },
  { id: 'course_3', title: 'Course Creator Pro', slug: 'course-creator', description: 'How to create and sell your first online course', niche: 'education', price: 197, status: 'draft', modules: generateCurriculumOutline('education', 2), totalLessons: 12, totalDurationMinutes: 240, enrollmentCount: 0, completionRate: 0, avgRating: 0, dripEnabled: false, dripIntervalDays: 0, certificateEnabled: false, createdAt: Date.now() - 3 * 86_400_000 },
];

const MOCK_PROGRESS: StudentProgress[] = [
  { userId: 'u1', courseId: 'course_1', enrollmentStatus: 'active', completedLessonIds: ['les_0_0', 'les_0_1', 'les_1_0'], quizScores: { q1: 90 }, lastAccessedAt: Date.now() - 86_400_000, totalTimeMinutes: 120, completionPct: 35, currentStreakDays: 5 },
];

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'builder' | 'analytics' | 'quiz'>('courses');
  const [selectedNiche, setSelectedNiche] = useState<'business' | 'fitness' | 'education'>('business');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<ReturnType<typeof scoreQuiz> | null>(null);

  const analytics = analyzeCoursePerformance(MOCK_COURSES[0], MOCK_PROGRESS);
  const outline = generateCurriculumOutline(selectedNiche, 4);

  const cert = issueCertificate('u1', 'Alex Creator', MOCK_COURSES[0]);

  function handleQuizSubmit() {
    setQuizResult(scoreQuiz(DEMO_QUIZ, quizAnswers));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Platform</h1>
          <p className="text-sm text-gray-400 mt-1">Curriculum builder · Adaptive learning · Quiz engine · Certificates · Drip</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">+ Create Course</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: MOCK_COURSES.length.toString() },
          { label: 'Total Students', value: MOCK_COURSES.reduce((a, c) => a + c.enrollmentCount, 0).toLocaleString() },
          { label: 'Avg Completion', value: `${Math.round(MOCK_COURSES.filter(c => c.enrollmentCount > 0).reduce((a, c) => a + c.completionRate, 0) / 2)}%` },
          { label: 'Course Revenue', value: `$${(MOCK_COURSES.reduce((a, c) => a + c.price * c.enrollmentCount, 0)).toLocaleString()}` },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['courses', 'builder', 'analytics', 'quiz'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'quiz' ? '✏️ Quiz Engine' : t === 'builder' ? '🏗️ Builder' : t}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className="space-y-3">
          {MOCK_COURSES.map(course => (
            <Card key={course.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-lg">{course.title}</p>
                      <Badge className={`text-xs ${course.status === 'published' ? 'bg-green-600 text-white' : course.status === 'draft' ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'}`}>{course.status}</Badge>
                      {course.dripEnabled && <Badge className="text-xs bg-blue-600/30 text-blue-400">Drip</Badge>}
                      {course.certificateEnabled && <Badge className="text-xs bg-violet-600/30 text-violet-400">Certificate</Badge>}
                    </div>
                    <p className="text-gray-400 text-sm">{course.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>{course.totalLessons} lessons</span>
                      <span>{Math.floor(course.totalDurationMinutes / 60)}h {course.totalDurationMinutes % 60}m</span>
                      <span>{course.modules.length} modules</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-xl">${course.price}</p>
                    <p className="text-gray-400 text-xs">{course.enrollmentCount} students</p>
                    {course.enrollmentCount > 0 && (
                      <>
                        <p className="text-yellow-400 text-xs">⭐ {course.avgRating.toFixed(1)}</p>
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full w-24">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{course.completionRate}% complete</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['business', 'fitness', 'education'] as const).map(n => (
              <button key={n} onClick={() => setSelectedNiche(n)}
                className={`px-3 py-1.5 text-xs rounded capitalize ${selectedNiche === n ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {outline.map((mod, mi) => (
              <Card key={mi} className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span>{mod.title}</span>
                    {mod.unlockAfterDays > 0 && <Badge className="bg-blue-600/30 text-blue-400 text-xs">Unlocks Day {mod.unlockAfterDays}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {mod.lessons.map((lesson, li) => (
                    <div key={li} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <span className="text-xs">{lesson.type === 'video' ? '🎬' : lesson.type === 'quiz' ? '✏️' : '📄'}</span>
                      <span className="text-gray-300 text-xs flex-1">{lesson.title}</span>
                      <span className="text-gray-500 text-xs">{lesson.durationMinutes}m</span>
                      {lesson.isFree && <Badge className="bg-green-600/20 text-green-400 text-xs">Free</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Avg Completion Rate', value: `${analytics.avgCompletionRate}%` },
              { label: 'Avg Quiz Score', value: `${analytics.avgQuizScore}%` },
              { label: 'NPS Score', value: analytics.npsScore.toString() },
              { label: 'Avg Days to Complete', value: `${analytics.avgTimeToComplete}d` },
              { label: 'Revenue/Student', value: `$${analytics.revenuePerStudent.toFixed(0)}` },
              { label: 'Engagement Trend', value: analytics.engagementTrend },
            ].map(s => (
              <Card key={s.label} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.label === 'Engagement Trend' && analytics.engagementTrend === 'improving' ? 'text-green-400' : 'text-violet-400'}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Drop-Off Lesson</CardTitle></CardHeader>
            <CardContent>
              <p className="text-yellow-400">⚠ Most students stop at: <span className="text-white">{analytics.dropOffLesson}</span></p>
              <p className="text-gray-400 text-xs mt-1">Consider adding an engagement hook or splitting this lesson into smaller segments.</p>
            </CardContent>
          </Card>

          {/* Sample Certificate */}
          <Card className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border-violet-500/30">
            <CardHeader><CardTitle className="text-white text-sm">🏆 Sample Certificate</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-white">This certifies that <span className="font-bold text-violet-300">{cert.recipientName}</span></p>
              <p className="text-gray-300">has successfully completed <span className="font-medium">{cert.courseName}</span></p>
              <p className="text-gray-400 text-xs">Verification Code: <code className="text-yellow-400">{cert.verificationCode}</code></p>
              <p className="text-gray-500 text-xs">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quiz: Creator Business Basics</CardTitle>
              <p className="text-gray-400 text-xs">Passing score: {DEMO_QUIZ.passingScore}% · {DEMO_QUIZ.attempts} attempts allowed</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEMO_QUIZ.questions.map(q => (
                <div key={q.id} className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white text-sm font-medium mb-3">{q.text} <span className="text-gray-500 text-xs">({q.points} pts)</span></p>
                  {q.options && (
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={q.id} value={opt}
                            checked={quizAnswers[q.id] === opt}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="accent-violet-500" />
                          <span className={`text-sm ${quizAnswers[q.id] === opt ? 'text-white' : 'text-gray-400'}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {quizResult && (
                    <div className="mt-2">
                      {quizResult.feedback.find(f => f.questionId === q.id)?.correct
                        ? <p className="text-green-400 text-xs">✓ Correct!</p>
                        : <p className="text-red-400 text-xs">✗ {quizResult.feedback.find(f => f.questionId === q.id)?.explanation}</p>
                      }
                    </div>
                  )}
                </div>
              ))}
              {!quizResult ? (
                <Button onClick={handleQuizSubmit} className="bg-violet-600 hover:bg-violet-700 text-white">Submit Quiz</Button>
              ) : (
                <div className={`p-4 rounded-lg ${quizResult.passed ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                  <p className={`font-bold text-lg ${quizResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {quizResult.passed ? '🎉 Passed!' : '❌ Not Passed'}
                  </p>
                  <p className="text-white">Score: {quizResult.score}% ({quizResult.correctCount}/{DEMO_QUIZ.questions.length} correct)</p>
                  {!quizResult.passed && <Button size="sm" onClick={() => setQuizResult(null)} className="mt-2 text-xs bg-white/10">Try Again</Button>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
