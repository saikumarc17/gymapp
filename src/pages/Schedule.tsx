import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';

interface ClassSchedule {
  id: number;
  name: string;
  trainer: number;
  timeStart: string;
  timeEnd: string;
  days: string[];
  capacity: number;
  enrolled: number;
  location: string;
  description: string;
}

interface Trainer {
  id: number;
  name: string;
}

interface Day {
  name: string;
  short: string;
  isWeekend: boolean;
}

const days: Day[] = [
  { name: 'Monday', short: 'Mon', isWeekend: false },
  { name: 'Tuesday', short: 'Tue', isWeekend: false },
  { name: 'Wednesday', short: 'Wed', isWeekend: false },
  { name: 'Thursday', short: 'Thu', isWeekend: false },
  { name: 'Friday', short: 'Fri', isWeekend: false },
  { name: 'Saturday', short: 'Sat', isWeekend: true },
  { name: 'Sunday', short: 'Sun', isWeekend: true }
];

const Schedule = () => {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, trainersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/trainers')
      ]);
      
      setClasses(classesRes.data);
      setTrainers(trainersRes.data);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = selectedDay === 'All' 
    ? classes 
    : classes.filter(c => c.days.includes(selectedDay));

  // Get trainer name by id
  const getTrainerName = (id: number) => {
    const trainer = trainers.find(t => t.id === id);
    return trainer ? trainer.name : 'Unknown';
  };

  // Format time from 24hr to 12hr
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Calculate enrollment percentage
  const enrollmentPercentage = (enrolled: number, capacity: number) => {
    return Math.round((enrolled / capacity) * 100);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Class Schedule</h1>
        <p className="text-text-light">View and manage gym classes</p>
      </div>

      {/* Day Selection Tabs */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors
              ${selectedDay === 'All' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-text-light hover:text-text hover:bg-gray-50'}
            `}
          >
            All Days
          </button>
          
          {days.map((day) => (
            <button
              key={day.name}
              onClick={() => setSelectedDay(day.name)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${selectedDay === day.name 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-text-light hover:text-text hover:bg-gray-50'}
                ${day.isWeekend ? 'bg-gray-50' : ''}
              `}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-card">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text">No Classes Scheduled</h3>
          <p className="text-text-light">There are no classes scheduled for {selectedDay === 'All' ? 'any day' : selectedDay}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <div 
              key={classItem.id}
              className="card hover:shadow-card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-secondary">{classItem.name}</h3>
                
                <div className="flex gap-1">
                  {classItem.days.map((day) => (
                    <span 
                      key={day}
                      className={`text-xs px-2 py-1 rounded-full
                        ${day === selectedDay 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-text-light'}
                      `}
                    >
                      {days.find(d => d.name === day)?.short}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-light">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {formatTime(classItem.timeStart)} - {formatTime(classItem.timeEnd)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-text-light">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Trainer: {getTrainerName(classItem.trainer)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-text-light">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{classItem.location}</span>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-text-light">
                {classItem.description}
              </p>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-text-light">
                    Enrollment: {classItem.enrolled}/{classItem.capacity}
                  </span>
                  <span className="text-xs font-medium text-text">
                    {enrollmentPercentage(classItem.enrolled, classItem.capacity)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      enrollmentPercentage(classItem.enrolled, classItem.capacity) > 75
                        ? 'bg-error'
                        : enrollmentPercentage(classItem.enrolled, classItem.capacity) > 50
                          ? 'bg-warning'
                          : 'bg-success'
                    }`}
                    style={{ width: `${enrollmentPercentage(classItem.enrolled, classItem.capacity)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;