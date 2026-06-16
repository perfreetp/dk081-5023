import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { OrderStep } from '@/types';
import styles from './index.module.scss';

interface ProgressStepProps {
  steps: OrderStep[];
  compact?: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ steps, compact = false }) => {
  const displaySteps = compact ? steps.slice(0, 5) : steps;

  return (
    <View className={styles.container}>
      <View className={styles.stepsRow}>
        {displaySteps.map((step, index) => (
          <View key={step.key} className={styles.stepItem}>
            {index < displaySteps.length - 1 && (
              <View
                className={classnames(
                  styles.line,
                  (step.status === 'done' || step.status === 'current') && styles.done
                )}
              />
            )}
            <View
              className={classnames(
                styles.circle,
                step.status === 'done' && styles.done,
                step.status === 'current' && styles.current
              )}
            >
              {step.status === 'done' ? '✓' : index + 1}
            </View>
            <View className={styles.stepContent}>
              <Text
                className={classnames(
                  styles.stepTitle,
                  step.status === 'done' && styles.done,
                  step.status === 'current' && styles.current
                )}
              >
                {step.title}
              </Text>
              {!compact && step.time && (
                <Text className={styles.stepTime}>{step.time.slice(5, 16)}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProgressStep;
