import { StyleSheet } from 'react-native';
import { space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: space[4],
    gap: space[3],
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fillHeight: { flex: 1 },
  list: { paddingVertical: space[2] },
  ticketItem: { marginBottom: space[4], marginHorizontal: space[1] },
  scopeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderBottomWidth: 1,
  },
  scopeCount: { fontSize: 13 },
  scopeTag: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  scopeTagOutline: { borderWidth: 1 },
  scopeTagText: { fontSize: 13 },
});
