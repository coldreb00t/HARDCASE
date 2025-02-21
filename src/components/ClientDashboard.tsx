import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, User } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

export function ClientDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <Dumbbell className="w-5 h-5 min-w-[20px]" />,
      label: 'Мои тренировки',
      onClick: () => console.log('Мои тренировки')
    },
    {
      icon: <Calendar className="w-5 h-5 min-w-[20px]" />,
      label: 'Расписание',
      onClick: () => console.log('Расписание')
    },
    {
      icon: <User className="w-5 h-5 min-w-[20px]" />,
      label: 'Профиль',
      onClick: () => console.log('Профиль')
    }
  ];

  return (
    <SidebarLayout
      title="HARDCASE"
      menuItems={menuItems}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Workout Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Следующая тренировка</h3>
          <div className="space-y-3">
            <p className="text-gray-600">Нет запланированных тренировок</p>
            <button className="text-orange-500 hover:text-orange-600">
              Записаться на тренировку
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Мой прогресс</h3>
          <div className="space-y-3">
            <p className="text-gray-600">Отслеживайте свой прогресс</p>
            <button className="text-orange-500 hover:text-orange-600">
              Посмотреть прогресс
            </button>
          </div>
        </div>

        {/* Goals Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Мои цели</h3>
          <div className="space-y-3">
            <p className="text-gray-600">Установите и отслеживайте свои цели</p>
            <button className="text-orange-500 hover:text-orange-600">
              Управление целями
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}