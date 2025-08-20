import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Edit, BarChart3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface PlayerCardProps {
  athlete: AthleteWithUser;
  onEdit?: (athlete: AthleteWithUser) => void;
  onViewStats?: (athlete: AthleteWithUser) => void;
}

/**
 * PlayerCard Component
 * Features:
 * - Displays athlete information in a card format
 * - Shows performance metrics and last training date
 * - Action buttons for edit, view stats, and delete
 * - Position badge with color coding
 * - Avatar with fallback initials
 */
export default function PlayerCard({ athlete, onEdit, onViewStats }: PlayerCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (athleteId: string) => {
      await apiRequest('DELETE', `/api/athletes/${athleteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      toast({
        title: 'Atleta removido',
        description: 'O atleta foi removido do sistema.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover atleta',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = () => {
    if (onEdit) {
      onEdit(athlete);
    }
  };

  const handleViewStats = () => {
    if (onViewStats) {
      onViewStats(athlete);
    }
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja remover ${athlete.user.fullName}?`)) {
      deleteMutation.mutate(athlete.id);
    }
  };

  const getPositionColor = (position?: string) => {
    if (!position) return 'bg-gray-100 text-gray-800';
    
    switch (position.toLowerCase()) {
      case 'armador':
        return 'bg-green-100 text-green-800';
      case 'ala':
        return 'bg-blue-100 text-blue-800';
      case 'pivô':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: string) => {
    const perf = parseFloat(performance);
    if (perf >= 80) return 'text-green-600';
    if (perf >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200" data-testid={`player-card-${athlete.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={athlete.user.profilePicture || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {athlete.user.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium truncate" data-testid="text-player-name">
                  {athlete.user.fullName}
                </p>
                {athlete.user.position && (
                  <Badge className={`text-xs ${getPositionColor(athlete.user.position)}`}>
                    {athlete.user.position}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {athlete.user.email}
              </p>
              
              <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="mr-1">Performance:</span>
                  <span className={`font-medium ${getPerformanceColor(athlete.overallPerformance)}`} data-testid="text-performance">
                    {athlete.overallPerformance}%
                  </span>
                </div>
                
                {athlete.lastTraining && (
                  <div>
                    <span className="mr-1">Último treino:</span>
                    <span data-testid="text-last-training">
                      {format(new Date(athlete.lastTraining), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              data-testid="button-edit-player"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewStats}
              className="h-8 w-8 p-0 text-primary hover:text-yellow-600 hover:bg-yellow-50"
              data-testid="button-view-stats"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
              data-testid="button-delete-player"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
