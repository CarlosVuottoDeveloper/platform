import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    padding: space[6],
    gap: space[6],
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.body,
    lineHeight: 24,
  },
  form: { gap: space[3] },
});
