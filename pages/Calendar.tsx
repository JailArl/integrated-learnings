import React, { useState } from 'react';
import { Section, Card } from '../components/Components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';

interface LessonEvent {
  id: string;
  date: Date;
  time: string;
  subject: string;
  tutor: string;
  location: string;
  type: 'upcoming' | 'past';
}

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Demo lessons
  const lessons: LessonEvent[] = [
    {
      id: '1',
      date: new Date(2026, 0, 20),
      time: '3:00 PM - 5:00 PM',
      subject: 'Mathematics (A-Math)',
      tutor: 'Mr. Lee Wei Ming',
      location: 'Student\'s Home',
      type: 'upcoming'
    },
    {
      id: '2',
      date: new Date(2026, 0, 22),
      time: '4:00 PM - 6:00 PM',
      subject: 'English',
      tutor: 'Ms. Sarah Chen',
      location: 'Online (Zoom)',
      type: 'upcoming'
    },
    {
      id: '3',
      date: new Date(2026, 0, 25),
      time: '2:00 PM - 4:00 PM',
      subject: 'Mathematics (A-Math)',
      tutor: 'Mr. Lee Wei Ming',
      location: 'Student\'s Home',
      type: 'upcoming'
    },
    {
      id: '4',
      date: new Date(2026, 0, 27),
      time: '4:00 PM - 6:00 PM',
      subject: 'English',
      tutor: 'Ms. Sarah Chen',
      location: 'Online (Zoom)',
      type: 'upcoming'
    },
    {
      id: '5',
      date: new Date(2026, 0, 13),
      time: '3:00 PM - 5:00 PM',
      subject: 'Mathematics (A-Math)',
      tutor: 'Mr. Lee Wei Ming',
      location: 'Student\'s Home',
      type: 'past'
    }
  ];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasLessonOnDate = (day: number) => {
    return lessons.some(lesson => {
      const lessonDate = lesson.date;
      return lessonDate.getDate() === day &&
             lessonDate.getMonth() === currentDate.getMonth() &&
             lessonDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getLessonsForDate = (date: Date | null) => {
    if (!date) return [];
    return lessons.filter(lesson => {
      return lesson.date.getDate() === date.getDate() &&
             lesson.date.getMonth() === date.getMonth() &&
             lesson.date.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const hasLesson = hasLessonOnDate(day);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            relative p-2 text-center cursor-pointer rounded-lg border transition-all
            ${isToday ? 'border-secondary bg-blue-50' : 'border-transparent'}
            ${isSelected ? 'bg-secondary text-white font-bold' : 'hover:bg-slate-50'}
            ${hasLesson && !isSelected ? 'bg-green-50 border-green-200' : ''}
          `}
        >
          <div className="text-sm">{day}</div>
          {hasLesson && !isSelected && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const upcomingLessons = lessons.filter(l => l.type === 'upcoming').sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Lesson Schedule</h1>
        <p className="text-slate-600">View and manage your upcoming lessons</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card title="Lesson Calendar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-bold text-slate-600 text-xs p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-50 border border-secondary rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                  <span>Has Lesson</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Date Lessons */}
          {selectedDate && getLessonsForDate(selectedDate).length > 0 && (
            <div className="mt-6">
              <Card title={`Lessons on ${selectedDate.toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}>
                <div className="space-y-4">
                  {getLessonsForDate(selectedDate).map(lesson => (
                    <div key={lesson.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 mb-2">{lesson.subject}</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{lesson.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>{lesson.tutor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{lesson.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lesson.type === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lesson.type === 'upcoming' ? 'Upcoming' : 'Past'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Upcoming Lessons Sidebar */}
        <div className="space-y-6">
          <Card title="Upcoming Lessons">
            {upcomingLessons.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-slate-500 text-sm">No upcoming lessons scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingLessons.slice(0, 5).map(lesson => (
                  <div
                    key={lesson.id}
                    className="border-l-4 border-secondary bg-slate-50 p-3 rounded-r-lg cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => setSelectedDate(lesson.date)}
                  >
                    <div className="text-xs font-bold text-secondary mb-1">
                      {lesson.date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-bold text-sm text-slate-800">{lesson.subject}</div>
                    <div className="text-xs text-slate-600 mt-1">{lesson.time}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-secondary hover:bg-blue-800 text-white rounded-lg font-bold text-sm transition">
                Request Reschedule
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 transition">
                Download Schedule
              </button>
              <button 
                onClick={() => window.location.href = '#/parents'}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};
