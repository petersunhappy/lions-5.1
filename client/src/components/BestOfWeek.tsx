import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp, Target, Users } from 'lucide-react';

interface BestOfWeekData {
  id: string;
  athleteId: string;
  weekStart: string;
  achievements: {
    shooting?: string;
    rebounds?: string;
    assists?: string;
    description?: string;
  };
  athlete: {
    id: string;
    userId: string;
    user: {
      id: string;
      fullName: string;
      profilePicture?: string;
      position?: string;
    };
  };
}

/**
 * BestOfWeek Component
 * Features:
 * - Displays featured athlete of the week
 * - Shows key performance statistics
 * - Professional basketball-themed design
 * - Responsive layout with gradient background
 */
export default function BestOfWeek() {
  const { data: bestOfWeek, isLoading, error } = useQuery<BestOfWeekData>({
    queryKey: ['/api/best-of-week'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <Card className="lions-gradient p-8 text-primary-foreground animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-black/20 rounded w-48"></div>
            <div className="h-8 w-8 bg-black/20 rounded"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-black/20 rounded-full"></div>
            <div className="space-y-4 flex-1">
              <div className="h-6 bg-black/20 rounded w-32"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-12 bg-black/20 rounded"></div>
                <div className="h-12 bg-black/20 rounded"></div>
                <div className="h-12 bg-black/20 rounded"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !bestOfWeek) {
    return (
      <div className="lg:col-span-2">
        <Card className="lions-gradient p-8 text-primary-foreground">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Destaque da Semana</h3>
            <Star className="w-8 h-8" />
          </div>
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum destaque definido para esta semana</p>
            <p className="text-sm opacity-75 mt-2">
              O administrador ainda não selecionou o atleta da semana
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const { athlete, achievements } = bestOfWeek;

  return (
    <div className="lg:col-span-2" data-testid="best-of-week">
      <Card className="lions-gradient p-8 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Destaque da Semana</h3>
          <Star className="w-8 h-8" />
        </div>
        
        <div className="flex items-center space-x-6">
          <Avatar className="w-24 h-24 border-4 border-primary-foreground">
            <AvatarImage 
              src={athlete?.user?.profilePicture || undefined}
              alt={athlete?.user?.fullName}
            />
            <AvatarFallback className="bg-primary-foreground text-primary text-xl">
              {athlete?.user?.fullName?.split(' ').map(n => n[0]).join('') || 'NA'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-2" data-testid="text-athlete-name">
              {athlete?.user?.fullName || 'Atleta não encontrado'}
            </h4>
            
            {athlete?.user?.position && (
              <p className="text-sm opacity-90 mb-4" data-testid="text-athlete-position">
                {athlete.user.position}
              </p>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              {achievements.shooting && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 mr-1" />
                  </div>
                  <p className="font-semibold">Arremessos</p>
                  <p data-testid="text-shooting-stat">{achievements.shooting}</p>
                </div>
              )}
              
              {achievements.rebounds && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                  </div>
                  <p className="font-semibold">Rebotes</p>
                  <p data-testid="text-rebounds-stat">{achievements.rebounds}</p>
                </div>
              )}
              
              {achievements.assists && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 mr-1" />
                  </div>
                  <p className="font-semibold">Assistências</p>
                  <p data-testid="text-assists-stat">{achievements.assists}</p>
                </div>
              )}
            </div>
            
            {achievements.description && (
              <p className="text-sm opacity-90 mt-4" data-testid="text-description">
                {achievements.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
