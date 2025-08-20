import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Target, TrainTrack, Dumbbell, Clock, Zap, Activity } from 'lucide-react';
import { Exercise } from '@shared/schema';

interface ExerciseCardProps {
  exercise: Exercise;
  onStartTraining?: (exerciseId: string) => void;
}

/**
 * ExerciseCard Component
 * Features:
 * - Displays individual exercise information
 * - Shows exercise metrics (repetitions, time, accuracy, etc.)
 * - Category-based icons and colors
 * - Video placeholder for instructional content
 * - Start training button
 */
export default function ExerciseCard({ exercise, onStartTraining }: ExerciseCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basketball':
        return <Target className="w-5 h-5" />;
      case 'aerobic':
        return <TrainTrack className="w-5 h-5" />;
      case 'strength':
        return <Dumbbell className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basketball':
        return 'bg-blue-100 text-blue-800';
      case 'aerobic':
        return 'bg-red-100 text-red-800';
      case 'strength':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'basketball':
        return 'Basquete';
      case 'aerobic':
        return 'Aeróbico';
      case 'strength':
        return 'Físico';
      default:
        return 'Geral';
    }
  };

  const handleStartTraining = () => {
    if (onStartTraining) {
      onStartTraining(exercise.id);
    }
  };

  return (
    <Card className="lions-card" data-testid={`exercise-card-${exercise.id}`}>
      <CardContent className="p-6">
        {/* Header with icon and category */}
        <div className="flex items-center justify-between mb-4">
          <div className={`rounded-lg p-3 ${
            exercise.category === 'basketball' ? 'bg-primary/10' :
            exercise.category === 'aerobic' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {getCategoryIcon(exercise.category)}
          </div>
          <Badge className={getCategoryColor(exercise.category)}>
            {getCategoryLabel(exercise.category)}
          </Badge>
        </div>

        {/* Exercise title and description */}
        <h3 className="text-lg font-semibold mb-2" data-testid="text-exercise-name">
          {exercise.name}
        </h3>
        {exercise.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm" data-testid="text-exercise-description">
            {exercise.description}
          </p>
        )}

        {/* Exercise metrics */}
        {exercise.metrics && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {exercise.metrics.repetitions && (
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-repetitions">
                  {exercise.metrics.repetitions}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Repetições</p>
              </div>
            )}
            
            {exercise.metrics.duration && (
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-duration">
                  {exercise.metrics.duration}min
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tempo</p>
              </div>
            )}

            {exercise.metrics.accuracy && (
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                <p className="text-2xl font-bold text-green-600" data-testid="text-accuracy">
                  {exercise.metrics.accuracy}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Precisão</p>
              </div>
            )}

            {exercise.metrics.distance && (
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                <p className="text-2xl font-bold text-green-600" data-testid="text-distance">
                  {exercise.metrics.distance}km
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Distância</p>
              </div>
            )}
          </div>
        )}

        {/* Video placeholder */}
        <div className="bg-gray-100 dark:bg-dark-bg rounded-lg h-32 flex items-center justify-center mb-4" data-testid="video-placeholder">
          <div className="text-center">
            <Play className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {exercise.videoUrl ? 'Vídeo Explicativo' : 'Sem vídeo disponível'}
            </p>
          </div>
        </div>

        {/* Start training button */}
        <Button
          onClick={handleStartTraining}
          className="w-full lions-btn-primary"
          data-testid="button-start-training"
        >
          <Play className="w-4 h-4 mr-2" />
          Iniciar Treino
        </Button>
      </CardContent>
    </Card>
  );
}
