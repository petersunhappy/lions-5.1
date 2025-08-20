import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/queryClient';
import PlayerCard from './PlayerCard';
import EventCalendar from './EventCalendar';
import { Users, TrendingUp, AlertTriangle, UserPlus, Calendar, Plus } from 'lucide-react';
import { insertBestOfWeekSchema, insertEventSchema } from '@shared/schema';

const bestOfWeekFormSchema = insertBestOfWeekSchema.extend({
  achievements: z.object({
    shooting: z.string().optional(),
    rebounds: z.string().optional(),
    assists: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

const eventFormSchema = insertEventSchema.extend({
  startDate: z.string(),
  endDate: z.string().optional(),
});

type BestOfWeekFormData = z.infer<typeof bestOfWeekFormSchema>;
type EventFormData = z.infer<typeof eventFormSchema>;

interface AthleteWithUser {
  id: string;
  userId: string;
  height?: string;
  weight?: string;
  overallPerformance: string;
  lastTraining?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    position?: string;
  };
}

/**
 * Admin Component
 * Features:
 * - Athlete management (view, edit, delete)
 * - Performance analytics and statistics
 * - Best of the week selection
 * - Event creation and management
 * - Calendar integration
 * - Admin dashboard with key metrics
 */
export default function Admin() {
  const { currentUser, isAdmin } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBestOfWeekOpen, setIsBestOfWeekOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center p-8">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  const { data: athletes = [], isLoading: athletesLoading } = useQuery<AthleteWithUser[]>({
    queryKey: ['/api/athletes'],
  });

  const bestOfWeekForm = useForm<BestOfWeekFormData>({
    resolver: zodResolver(bestOfWeekFormSchema),
    defaultValues: {
      athleteId: '',
      weekStart: new Date(),
      setBy: currentUser?.id || '',
      achievements: {
        shooting: '',
        rebounds: '',
        assists: '',
        description: '',
      },
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: 'training',
      startDate: '',
      endDate: '',
      mandatory: false,
      createdBy: currentUser?.id || '',
    },
  });

  const setBestOfWeekMutation = useMutation({
    mutationFn: async (data: BestOfWeekFormData) => {
      const response = await apiRequest('POST', '/api/best-of-week', {
        ...data,
        weekStart: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/best-of-week'] });
      setIsBestOfWeekOpen(false);
      bestOfWeekForm.reset();
      toast({
        title: 'Destaque da semana definido!',
        description: 'O atleta foi selecionado como destaque da semana.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao definir destaque',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest('POST', '/api/events', {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsEventOpen(false);
      eventForm.reset();
      toast({
        title: 'Evento criado!',
        description: 'Novo evento adicionado ao calendário.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar evento',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const onBestOfWeekSubmit = (data: BestOfWeekFormData) => {
    setBestOfWeekMutation.mutate(data);
  };

  const onEventSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  // Calculate stats
  const totalAthletes = athletes.length;
  const averagePerformance = athletes.length > 0 
    ? (athletes.reduce((sum, athlete) => sum + parseFloat(athlete.overallPerformance || '0'), 0) / athletes.length).toFixed(1)
    : '0';
  const recentAbsences = athletes.filter(athlete => {
    if (!athlete.lastTraining) return true;
    const lastTraining = new Date(athlete.lastTraining);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return lastTraining < threeDaysAgo;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Painel Administrativo</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie atletas, treinos e eventos
          </p>
        </div>
        <div className="flex space-x-4">
          <Dialog open={isBestOfWeekOpen} onOpenChange={setIsBestOfWeekOpen}>
            <DialogTrigger asChild>
              <Button className="lions-btn-primary" data-testid="button-set-best-of-week">
                <Plus className="w-4 h-4 mr-2" />
                Destaque da Semana
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Definir Destaque da Semana</DialogTitle>
              </DialogHeader>
              <form onSubmit={bestOfWeekForm.handleSubmit(onBestOfWeekSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Atleta</Label>
                  <Select onValueChange={(value) => bestOfWeekForm.setValue('athleteId', value)}>
                    <SelectTrigger data-testid="select-athlete">
                      <SelectValue placeholder="Selecione um atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {athletes.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Arremessos</Label>
                    <Input
                      placeholder="85% acerto"
                      {...bestOfWeekForm.register('achievements.shooting')}
                      data-testid="input-shooting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rebotes</Label>
                    <Input
                      placeholder="12/jogo"
                      {...bestOfWeekForm.register('achievements.rebounds')}
                      data-testid="input-rebounds"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assistências</Label>
                    <Input
                      placeholder="8/jogo"
                      {...bestOfWeekForm.register('achievements.assists')}
                      data-testid="input-assists"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva os principais feitos do atleta..."
                    {...bestOfWeekForm.register('achievements.description')}
                    data-testid="textarea-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full lions-btn-primary"
                  disabled={setBestOfWeekMutation.isPending}
                  data-testid="button-confirm-best-of-week"
                >
                  {setBestOfWeekMutation.isPending ? 'Definindo...' : 'Definir Destaque'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-event">
                <Calendar className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Nome do evento"
                    {...eventForm.register('title')}
                    data-testid="input-event-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descrição do evento..."
                    {...eventForm.register('description')}
                    data-testid="textarea-event-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select onValueChange={(value) => eventForm.setValue('eventType', value)}>
                      <SelectTrigger data-testid="select-event-type">
                        <SelectValue placeholder="Tipo de evento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Treino</SelectItem>
                        <SelectItem value="game">Jogo</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data/Hora</Label>
                    <Input
                      type="datetime-local"
                      {...eventForm.register('startDate')}
                      data-testid="input-event-date"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mandatory"
                    {...eventForm.register('mandatory')}
                    data-testid="checkbox-mandatory"
                  />
                  <Label htmlFor="mandatory">Participação obrigatória</Label>
                </div>

                <Button
                  type="submit"
                  className="w-full lions-btn-primary"
                  disabled={createEventMutation.isPending}
                  data-testid="button-confirm-event"
                >
                  {createEventMutation.isPending ? 'Criando...' : 'Criar Evento'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="lions-card" data-testid="card-total-athletes">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <Users className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Atletas</p>
                <p className="text-2xl font-bold" data-testid="text-total-athletes">{totalAthletes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lions-card" data-testid="card-average-performance">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <TrendingUp className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Média de Performance</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-average-performance">
                  {averagePerformance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lions-card" data-testid="card-recent-absences">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ausências Esta Semana</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-recent-absences">
                  {recentAbsences}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Athletes Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lions-card" data-testid="card-athletes-management">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Gestão de Atletas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {athletesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : athletes.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum atleta cadastrado
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {athletes.map((athlete) => (
                  <PlayerCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Calendar */}
        <EventCalendar />
      </div>
    </div>
  );
}
