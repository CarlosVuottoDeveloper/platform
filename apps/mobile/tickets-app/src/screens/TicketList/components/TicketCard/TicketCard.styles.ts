import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space[2],
  },
  title: {
    fontFamily: fontFamily.heading,
    flex: 1,
    fontSize: fontSize.h5,
    fontWeight: fontWeight.heading,
  },
  meta: { fontFamily: fontFamily.body, fontSize: 12 },
});
