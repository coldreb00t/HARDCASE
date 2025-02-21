import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  FileText, 
  Ruler,
  Calendar,
  Users,
  Apple,
  Activity,
  LineChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ProgramBuilder } from './ProgramBuilder';
import { WorkoutModal } from './WorkoutModal';
import { SidebarLayout } from './SidebarLayout';

type TabType = 'program' | 'nutrition' | 'activity' | 'metrics' | 'analysis' | 'measurements';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subscription_status: string;
  programs: Program[];
}

interface Program {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: string;
  video_url?: string;
  exercise_order: number;
  notes?: string;
  sets: {
    set_number: number;
    reps: string;
    weight: string;
  }[];
}

const tabs = [
  { id: 'program', label: 'Программа', icon: Dumbbell },
  { id: 'nutrition', label: 'Питание', icon: Apple },
  { id: 'activity', label: 'Бытовая активность', icon: Activity },
  { id: 'metrics', label: 'Показатели', icon: LineChart },
  { id: 'analysis', label: 'Анализы', icon: FileText },
  { id: 'measurements', label: 'Измерения', icon: Ruler },
] as const;

export function ClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('program');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const { data: clientData, error: clientError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);
    } catch (error: any) {
      console.error('Error fetching client data:', error);
      toast.error('Ошибка при загрузке данных клиента');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: <Users className="w-5 h-5 min-w-[20px]" />,
      label: 'Клиенты',
      onClick: () => navigate('/trainer/clients')
    },
    {
      icon: <Calendar className="w-5 h-5 min-w-[20px]" />,
      label: 'Расписание',
      onClick: () => navigate('/trainer/calendar')
    }
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (!client) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Клиент не найден</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'program':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Программы тренировок</h3>
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setShowProgramBuilder(true);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Создать программу
              </button>
            </div>
            {showProgramBuilder ? (
              <ProgramBuilder
                clientId={clientId!}
                programId={editingProgram?.id}
                onSave={() => {
                  setShowProgramBuilder(false);
                  setEditingProgram(null);
                  fetchClientData();
                }}
                onCancel={() => {
                  setShowProgramBuilder(false);
                  setEditingProgram(null);
                }}
              />
            ) : (
              <div className="space-y-6">
                {client.programs?.map((program) => (
                  <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{program.title}</h3>
                          <p className="text-gray-600 mt-1">{program.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(program.created_at).toLocaleDateString('ru-RU')}
                            <span className={`ml-4 px-2 py-1 rounded-full ${
                              program.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {program.status === 'active' ? 'Активна' : 'Завершена'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                №
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Упражнение
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Подходы
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {program.exercises.map((exercise, index) => (
                              <tr key={exercise.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {exercise.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div className="space-y-1">
                                    {exercise.sets.map((set, setIndex) => (
                                      <div key={setIndex} className="flex items-center space-x-2">
                                        <span className="text-gray-500">#{set.set_number}:</span>
                                        <span>{set.reps} повт.</span>
                                        {set.weight && (
                                          <span className="text-gray-500">× {set.weight} кг</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'nutrition':
      case 'activity':
      case 'metrics':
      case 'analysis':
      case 'measurements':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Раздел в разработке</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Клиент не найден</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      title="HARDCASE"
      menuItems={menuItems}
      backTo="/trainer/clients"
    >
      {/* Client Header */}
      <div className="bg-white shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold text-orange-500">
              {client.first_name[0]}{client.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
              {client.first_name} {client.last_name}
            </h2>
            <p className="text-gray-600 truncate">{client.email}</p>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm ${
              client.subscription_status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {client.subscription_status === 'active' ? 'Активная подписка' : 'Подписка неактивна'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md mb-4 md:mb-6 sticky top-0 z-10">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex p-2 md:p-3 space-x-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 md:px-6 pb-6">
        {renderTabContent()}
      </div>

      {/* Workout Modal */}
      {showWorkoutModal && (
        <WorkoutModal
          isOpen={showWorkoutModal}
          onClose={() => {
            setShowWorkoutModal(false);
            setSelectedProgram(null);
          }}
          selectedDate={selectedDate}
          onWorkoutCreated={fetchClientData}
          workout={null}
          program={selectedProgram}
          clientId={clientId}
        />
      )}
    </SidebarLayout>
  );
}