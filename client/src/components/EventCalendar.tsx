import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  mandatory: boolean;
}

/**
 * EventCalendar Component
 * Features:
 * - Monthly calendar view with event display
 * - Event creation, editing, and deletion
 * - Event type categorization with color coding
 * - Navigation between months
 * - Event details on hover/click
 */
export default function EventCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('DELETE', `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: 'Evento removido',
        description: 'O evento foi removido do calendário.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover evento',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Tem certeza que deseja remover este evento?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const getEventTypeColor = (eventType: string, mandatory: boolean) => {
    if (eventType === 'game') return 'bg-green-100 text-green-800 border-green-200';
    if (mandatory) return 'bg-primary/20 text-primary-foreground border-primary/30';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'training': return 'Treino';
      case 'game': return 'Jogo';
      case 'meeting': return 'Reunião';
      default: return 'Evento';
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), date)
    );
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Card className="lions-card" data-testid="event-calendar">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendário de Eventos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              data-testid="button-previous-month"
            >
              ←
            </Button>
            <span className="font-medium min-w-[150px] text-center" data-testid="text-current-month">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              →
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Calendar header - days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center font-medium text-sm text-gray-600 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square border rounded p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors ${
                      isToday ? 'bg-primary/10 border-primary' : 'border-gray-200 dark:border-dark-border'
                    } ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${
                      !isSameMonth(day, currentMonth) ? 'opacity-50' : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                    data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event, index) => (
                          <div
                            key={event.id}
                            className={`w-full h-1 rounded mt-1 ${getEventTypeColor(event.eventType, event.mandatory).split(' ')[0]}`}
                            title={event.title}
                          />
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day events */}
            {selectedDate && (
              <div className="mt-6 border-t pt-4" data-testid="selected-day-events">
                <h4 className="font-semibold mb-3">
                  Eventos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h4>
                
                {getEventsForDay(selectedDate).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum evento agendado para este dia.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDay(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg"
                        data-testid={`event-${event.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium" data-testid="text-event-title">
                              {event.title}
                            </h5>
                            <Badge className={getEventTypeColor(event.eventType, event.mandatory)}>
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                            {event.mandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                            </div>
                            
                            {event.description && (
                              <span className="truncate max-w-[200px]">
                                {event.description}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                            data-testid={`button-edit-event-${event.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
