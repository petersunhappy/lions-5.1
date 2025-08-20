import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import BestOfWeek from './BestOfWeek';
import { Clock, TrendingUp, Trophy, Heart, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  nextTraining?: {
    title: string;
    startDate: string;
    eventType: string;
  };
  weeklyProgress: number;
  completedTrainings: number;
  totalTrainings: number;
  sleepHours: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  eventType: string;
  mandatory: boolean;
}

/**
 * Dashboard Component
 * Features:
 * - Welcome message with user info
 * - Quick stats cards (next training, progress, completed trainings, sleep)
 * - Best of the Week highlight section
 * - Upcoming trainings list
 * - Performance charts placeholders
 * - Responsive grid layout
 */
export default function Dashboard() {
  const { currentUser } = useApp();

  // Mock stats data - in real app this would come from API
  const stats: DashboardStats = {
    nextTraining: {
      title: 'Treino Físico',
      startDate: new Date().toISOString(),
      eventType: 'training',
    },
    weeklyProgress: 15,
    completedTrainings: 12,
    totalTrainings: 15,
    sleepHours: '7.5',
  };

  const { data: upcomingEvents = [] } = useQuery<UpcomingEvent[]>({
    queryKey: ['/api/events', { upcoming: 'true' }],
    select: (data) => data?.slice(0, 3) || [], // Get only first 3 events
  });

  if (!currentUser) {
    return null;
  }

  const getEventTypeColor = (eventType: string, mandatory: boolean) => {
    if (eventType === 'game') return 'bg-green-100 text-green-800';
    if (mandatory) return 'bg-primary text-primary-foreground';
    return 'bg-blue-100 text-blue-800';
  };

  const getEventTypeLabel = (eventType: string, mandatory: boolean) => {
    if (eventType === 'game') return 'Jogo';
    if (mandatory) return 'Obrigatório';
    return 'Opcional';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Bem-vindo de volta, <span className="text-primary" data-testid="text-user-name">{currentUser.fullName.split(' ')[0]}</span>!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe seu progresso e próximos treinos</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lions-card" data-testid="card-next-training">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-lg p-3 mr-4">
                <Clock className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Próximo Treino</p>
                <p className="text-lg font-semibold" data-testid="text-next-training">
                  {stats.nextTraining ? 'Hoje, 18:00' : 'Nenhum agendado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lions-card" data-testid="card-weekly-progress">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <TrendingUp className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Evolução Semanal</p>
                <p className="text-lg font-semibold text-green-600" data-testid="text-weekly-progress">
                  +{stats.weeklyProgress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lions-card" data-testid="card-completed-trainings">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <Trophy className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Treinos Concluídos</p>
                <p className="text-lg font-semibold" data-testid="text-completed-trainings">
                  {stats.completedTrainings}/{stats.totalTrainings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lions-card" data-testid="card-sleep-hours">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <Heart className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Horas de Sono</p>
                <p className="text-lg font-semibold" data-testid="text-sleep-hours">
                  {stats.sleepHours}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Best of the Week Card */}
        <BestOfWeek />

        {/* Upcoming Training */}
        <Card className="lions-card" data-testid="card-upcoming-trainings">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Próximos Treinos
            </h3>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum treino agendado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg"
                    data-testid={`upcoming-event-${event.id}`}
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(event.startDate), "EEEE, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(
                        event.eventType,
                        event.mandatory
                      )}`}
                    >
                      {getEventTypeLabel(event.eventType, event.mandatory)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="mt-8">
        <Card className="lions-card" data-testid="card-performance-charts">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Evolução de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chart placeholders */}
              <div className="h-64 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Gráfico de Arremessos</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Precisão de arremessos ao longo do tempo
                  </p>
                </div>
              </div>
              
              <div className="h-64 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Gráfico de Condicionamento</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Métricas de condicionamento físico
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
