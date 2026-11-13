import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import {
  color,
  fontSize,
  fontWeight,
  fontFamily,
  lineHeight,
  resolveLineHeight,
} from '@industry/tokens';

const meta: Meta = {
  title: 'Foundations/Typography',
};

export default meta;
type Story = StoryObj;

const HEADING_KEYS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

export const Headings: Story = {
  render: () => (
    <View>
      {HEADING_KEYS.map((key) => (
        <View
          key={key}
          style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginVertical: 4 }}
        >
          <Text style={{ width: 64, fontSize: 10, opacity: 0.45, color: color.text }}>
            {key.toUpperCase()} · {fontSize[key]}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.heading,
              fontWeight: fontWeight.heading,
              fontSize: fontSize[key],
              lineHeight: resolveLineHeight(fontSize[key], lineHeight.heading),
              color: color.text,
            }}
          >
            Um design system de uma só voz
          </Text>
        </View>
      ))}
    </View>
  ),
};

export const Body: Story = {
  render: () => (
    <View>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontWeight: fontWeight.body,
          fontSize: 17,
          color: color.text,
          marginVertical: 6,
        }}
      >
        Tokens de design descrevem uma aparência uma vez e deixam cada página herdar.
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontWeight: fontWeight.body,
          fontSize: 15,
          color: color.text,
          marginVertical: 6,
        }}
      >
        The quick brown fox jumps over the lazy dog — corpo de texto no tamanho de leitura.
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontWeight: fontWeight.body,
          fontSize: 13,
          color: color.text,
          opacity: 0.55,
          marginVertical: 6,
        }}
      >
        Legendas, metadados e notas de rodapé vivem aqui, um degrau mais quietas que o corpo.
      </Text>
    </View>
  ),
};
