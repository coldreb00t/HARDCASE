import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Calendar, 
  User, 
  ChevronRight, 
  Activity,
  LineChart,
  Clock,
  Trophy,
  Bell,
  Plus,
  Camera,
  Ruler,
  X,
  Apple
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SidebarLayout } from './SidebarLayout';
import toast from 'react-hot-toast';

interface Program {
  id: string;
  title: string;
  description: string;
  status: string;
  exercises: {
    id: string;
    name: string;
    description: string;
    exercise_order: number;
    notes?: string;
    sets: {
      set_number: number;
      reps: string;
      weight: string;
    }[];
  }[];
}

interface Workout {
  id: string;
  start_time: string;
  title: string;
}

interface WorkoutStats {
  total: number;
}

export function ClientDashboard() {
  const navigate = useNavigate();
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<WorkoutStats>({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Пожалуйста, войдите в систему');
        navigate('/login');
        return;
      }

      // Получаем ID клиента
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError) {
        if (clientError.code === 'PGRST116') {
          toast.error('Профиль клиента не найден');
          return;
        }
        throw clientError;
      }

      // Получаем следующую тренировку
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id, start_time, title')
        .eq('client_id', clientData.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(1);

      if (workoutsError) throw workoutsError;

      // Получаем программы тренировок с упражнениями и подходами
      const { data: programsData, error: programsError } = await supabase
        .from('client_programs')
        .select(`
          program:training_programs (
            id,
            title,
            description,
            exercises:program_exercises (
              id,
              exercise:strength_exercises (
                id,
                name,
                description
              ),
              exercise_order,
              notes,
              sets:exercise_sets (
                set_number,
                reps,
                weight
              )
            )
          ),
          status
        `)
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      // Получаем статистику за текущий месяц
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error: statsError } = await supabase
        .from('workouts')
        .select('id', { count: 'exact' })
        .eq('client_id', clientData.id)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', new Date().toISOString());

      if (statsError) throw statsError;

      setNextWorkout(workouts?.[0] || null);
      setMonthlyStats({ total: count || 0 });
      setPrograms(programsData?.map(p => ({
        ...p.program,
        status: p.status,
        exercises: p.program.exercises.map(e => ({
          id: e.exercise.id,
          name: e.exercise.name,
          description: e.exercise.description,
          exercise_order: e.exercise_order,
          notes: e.notes,
          sets: e.sets || []
        })).sort((a, b) => a.exercise_order - b.exercise_order)
      })) || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.code === 'PGRST116') {
        toast.error('Профиль клиента не найден');
      } else if (error.message === 'Failed to fetch') {
        toast.error('Ошибка подключения к серверу. Пожалуйста, проверьте подключение к интернету.');
      } else {
        toast.error('Ошибка при загрузке данных');
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: <Dumbbell className="w-5 h-5 min-w-[20px]" />,
      label: 'Мои тренировки',
      onClick: () => navigate('/client/workouts')
    },
    {
      icon: <Calendar className="w-5 h-5 min-w-[20px]" />,
      label: 'Расписание',
      onClick: () => navigate('/client/schedule')
    },
    {
      icon: <User className="w-5 h-5 min-w-[20px]" />,
      label: 'Профиль',
      onClick: () => navigate('/client/profile')
    }
  ];

  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleFabClick = () => {
    setShowFabMenu(!showFabMenu);
  };

  const handleMenuItemClick = (action: string) => {
    setShowFabMenu(false);
    switch (action) {
      case 'activity':
        navigate('/client/activity/new');
        break;
      case 'measurements':
        navigate('/client/measurements/new');
        break;
      case 'photo':
        navigate('/client/progress-photo/new');
        break;
      case 'nutrition':
        navigate('/client/nutrition/new');
        break;
    }
  };

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const handleWorkoutClick = () => {
    if (nextWorkout) {
      navigate(`/client/workouts/${nextWorkout.id}`);
    } else {
      navigate('/client/schedule');
    }
  };

  return (
    <SidebarLayout
      title="HARDCASE"
      menuItems={menuItems}
    >
      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Мой прогресс</h2>
          <LineChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Тренировок в этом месяце</p>
              <p className="text-2xl font-bold mt-1">{monthlyStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/client/stats')}
            className="w-full py-2 text-orange-500 font-medium"
          >
            Смотреть статистику
          </button>
        </div>
      </div>

      {/* Next Workout Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Следующая тренировка</h2>
          <Bell className="w-5 h-5 text-gray-400" />
        </div>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <button
            onClick={handleWorkoutClick}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-orange-500 mr-3" />
              <div>
                {nextWorkout ? (
                  <>
                    <p className="font-medium text-left">{nextWorkout.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatWorkoutDate(nextWorkout.start_time)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-left">Нет запланированных тренировок</p>
                    <p className="text-sm text-gray-500 mt-1">Записаться на тренировку</p>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Programs Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Мои программы</h2>
          <Dumbbell className="w-5 h-5 text-gray-400" />
        </div>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : programs.length > 0 ? (
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleProgram(program.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-left">{program.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{program.description}</p>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedProgram === program.id ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedProgram === program.id && (
                  <div className="border-t p-4">
                    <h4 className="font-medium mb-3">Упражнения:</h4>
                    <div className="space-y-3">
                      {program.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{index + 1}. {exercise.name}</span>
                          </div>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                          )}
                          {exercise.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">{exercise.notes}</p>
                          )}
                          <div className="mt-2 space-y-1">
                            {exercise.sets.map((set) => (
                              <div key={set.set_number} className="text-sm text-gray-600">
                                Подход {set.set_number}: {set.reps} повторений
                                {set.weight && ` × ${set.weight} кг`}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            У вас пока нет программ тренировок
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <button 
          onClick={() => navigate('/client/activity')}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <span className="font-medium">Активность</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate('/client/measurements')}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <LineChart className="w-5 h-5 text-purple-500" />
            </div>
            <span className="font-medium">Измерения</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        {/* FAB Menu */}
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="py-2">
              <button
                onClick={() => handleMenuItemClick('activity')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <Activity className="w-5 h-5 text-green-500" />
                <span>Добавить активность</span>
              </button>
              <button
                onClick={() => handleMenuItemClick('measurements')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <Ruler className="w-5 h-5 text-blue-500" />
                <span>Добавить замеры</span>
              </button>
              <button
                onClick={() => handleMenuItemClick('photo')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <Camera className="w-5 h-5 text-purple-500" />
                <span>Фото прогресса</span>
              </button>
              <button
                onClick={() => handleMenuItemClick('nutrition')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <Apple className="w-5 h-5 text-red-500" />
                <span>Отчет по питанию</span>
              </button>
            </div>
          </div>
        )}
        
        {/* FAB Button */}
        <button
          onClick={handleFabClick}
          className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
        >
          {showFabMenu ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>
    </SidebarLayout>
  );
}