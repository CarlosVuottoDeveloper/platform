import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { accentRamp, color, fontSize, neutral, radii } from '@industry/tokens';

export interface Step {
  label?: ReactNode;
}

export interface StepperProps {
  steps?: (string | Step)[];
  /** Zero-based index of the current step. Earlier steps read as done. */
  current?: number;
  style?: StyleProp<ViewStyle>;
}

function resolveStep(step: string | Step): Step {
  return typeof step === 'string' ? { label: step } : step;
}

export function Stepper({ steps = [], current = 0, style }: StepperProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }, style]}>
      {steps.map((step, index) => {
        const { label } = resolveStep(step);
        const done = index < current;
        const isCurrent = index === current;

        return (
          <Fragment key={typeof label === 'string' ? label : index}>
            <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
              <View
                testID={`stepper-dot-${index}`}
                style={{
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radii.pill,
                  backgroundColor: isCurrent
                    ? color.accent
                    : done
                      ? accentRamp['700']
                      : color.surface2,
                  borderWidth: isCurrent || done ? 0 : 1,
                  borderColor: color.controlBorder,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: isCurrent ? color.bg : done ? color.text : neutral['400'],
                  }}
                >
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: fontSize.h6,
                  textAlign: 'center',
                  color: isCurrent ? color.text : neutral['400'],
                }}
              >
                {label}
              </Text>
            </View>
            {index < steps.length - 1 ? (
              <View style={{ height: 1, flex: 1, marginTop: 13, backgroundColor: color.divider }} />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}
