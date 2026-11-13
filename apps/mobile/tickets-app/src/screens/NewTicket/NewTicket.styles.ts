import { StyleSheet } from 'react-native';
import { fontFamily, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: space[6], gap: space[4] },
  metaLine: { fontFamily: fontFamily.body, fontSize: 11 },
  submitButton: { flex: 1 },
});
