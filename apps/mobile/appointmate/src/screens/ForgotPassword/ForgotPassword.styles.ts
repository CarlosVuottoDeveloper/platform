import { StyleSheet } from 'react-native';
import { space } from '@industry/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    padding: space[6],
  },
  form: { gap: space[3] },
});
